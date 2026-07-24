import express, { type Express } from "express";
import fs from "fs";
import path from "path";

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
      `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\nSitemap: ${BASE_URL}/sitemap.xml\n`
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

  // Static assets
  app.use(express.static(distPath));

  // ── History API fallback: serve index.html for all non-API, non-asset routes ──
  app.use("/{*path}", (req, res) => {
    // Never intercept API calls or known static files
    if (req.path.startsWith("/api/")) return res.status(404).json({ error: "Not found" });
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
