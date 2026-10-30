import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { buildPage, renderHtml, LEGACY_PREFIX } from "./seo";

const BASE_URL = "https://www.terroirandcraft.online";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // No-cache for images so updates show immediately
  app.use("/bottle-shots", express.static(path.join(distPath, "bottle-shots"), {
    setHeaders: (res) => { res.setHeader("Cache-Control", "no-cache, must-revalidate"); }
  }));
  app.use("/brand-logos", express.static(path.join(distPath, "brand-logos"), {
    setHeaders: (res) => { res.setHeader("Cache-Control", "no-cache, must-revalidate"); }
  }));

  // ── robots.txt ─────────────────────────────────────────────────────────────
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(
      `User-agent: *\nAllow: /\n# Public read-only data the pages need to render (Googlebot must be able to fetch these)\nAllow: /api/products\nAllow: /api/stock\nAllow: /api/occasions\nAllow: /api/fine-rare\nDisallow: /api/\nDisallow: /admin\nSitemap: ${BASE_URL}/sitemap.xml\n`
    );
  });

  // ── sitemap.xml ────────────────────────────────────────────────────────────
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      // Dynamic import to avoid circular deps
      const { storage } = await import("./storage");
      const products = await storage.getAllProducts();

      const staticPages = [
        { loc: "/", priority: "1.0", changefreq: "weekly" },
        { loc: "/wines", priority: "0.9", changefreq: "daily" },
        { loc: "/spirits", priority: "0.8", changefreq: "weekly" },
        { loc: "/brands", priority: "0.8", changefreq: "weekly" },
        { loc: "/about", priority: "0.5", changefreq: "monthly" },
        { loc: "/promotions", priority: "0.7", changefreq: "weekly" },
        { loc: "/new-arrivals", priority: "0.8", changefreq: "daily" },
        // Occasion pages
        { loc: "/occasion?type=gifts", priority: "0.7", changefreq: "weekly" },
        { loc: "/occasion?type=easyreds", priority: "0.7", changefreq: "weekly" },
        { loc: "/occasion?type=staffpicks", priority: "0.7", changefreq: "weekly" },
        { loc: "/occasion?type=bbq", priority: "0.7", changefreq: "weekly" },
        { loc: "/occasion?type=hotpot", priority: "0.7", changefreq: "weekly" },
      ];

      // Brand pages
      const brands = [...new Set(products.map((p: any) => p.brand))];
      const brandPages = brands.map((b: any) => ({
        loc: `/brands/${encodeURIComponent(b)}`,
        priority: "0.7",
        changefreq: "weekly",
      }));

      // Product pages
      const productPages = products.map((p: any) => ({
        loc: `/wines/${p.id}`,
        priority: "0.8",
        changefreq: "monthly",
      }));

      const today = new Date().toISOString().split("T")[0];

      const urls = [...staticPages, ...brandPages, ...productPages]
        .map(({ loc, priority, changefreq }) =>
          `  <url>\n    <loc>${BASE_URL}${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
        )
        .join("\n");

      res.type("application/xml").send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
      );
    } catch (e) {
      res.status(500).send("Sitemap generation failed");
    }
  });

  // Apex domain -> www (canonical host)
  app.use((req, res, next) => {
    const host = (req.headers.host || "").toLowerCase().split(":")[0];
    if (host === "terroirandcraft.online") return res.redirect(301, `${BASE_URL}${req.originalUrl}`);
    next();
  });

  // Old website (previous host) language URLs -> home
  app.use((req, res, next) => {
    if (LEGACY_PREFIX.test(req.path)) return res.redirect(301, "/");
    next();
  });

  // Static assets (index.html is rendered with per-page SEO below, not served raw)
  app.use(express.static(distPath, { index: false }));

  // ── History API fallback: SPA shell with server-rendered SEO tags + crawlable content ──
  const templatePath = path.resolve(distPath, "index.html");
  let template = fs.readFileSync(templatePath, "utf-8");
  app.use("/{*path}", async (req, res) => {
    const urlPath = decodeURI(req.originalUrl.split("?")[0]);
    // Never intercept API calls or known static files
    if (urlPath.startsWith("/api/")) return res.status(404).json({ error: "Not found" });
    // Missing asset files should be real 404s, not the app shell
    if (/\.[a-zA-Z0-9]{2,5}$/.test(urlPath)) return res.status(404).type("text/plain").send("Not found");
    try {
      const { storage } = await import("./storage");
      const products = await storage.getAllProducts();
      const page = buildPage(urlPath, req.query as Record<string, any>, products as any[]);
      res.status(page.status).type("html").send(renderHtml(template, page, urlPath));
    } catch (e) {
      console.error("[SEO] render failed, serving plain shell:", e);
      res.sendFile(templatePath);
    }
  });
}
