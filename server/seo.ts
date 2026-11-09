// Server-side SEO: injects per-page <title>, meta, canonical, JSON-LD and crawlable
// text/links into the SPA shell so search engines see real content without running JS.
import { productTitle, productMetaDesc, brandTitle } from "../client/src/lib/slugs";

export const BASE_URL = "https://www.terroirandcraft.online";
const SITE_NAME = "Terroir & Craft 天地人酒業";
const DEFAULT_IMAGE = `${BASE_URL}/bottle-shots/og-default.png`;

const KNOWN_TOP = new Set([
  "", "wines", "spirits", "brands", "about", "cart", "sommelier", "member", "fine-rare",
  "promotions", "terms", "reset-password", "occasion", "new-arrivals", "payment-result",
  "blog", "admin",
]);
const NOINDEX_TOP = new Set(["cart", "member", "admin", "payment-result", "reset-password"]);

// Old website (previous host) language prefixes -> permanent redirect to home
export const LEGACY_PREFIX = /^\/(en-gb|zh-hk|zh-hant-hk|zh-hant|zh-tw|zh-cn|en-us)(\/|$)/i;

const BLOG: Record<string, { title: string; excerpt: string }> = {
  "chateau-saint-cosme-2024-vintage": {
    title: "Chateau de Saint Cosme — RP 100pts, Drops of God & Full Range Offer",
    excerpt: "Hominis Fides 2007 scored a perfect 100 from Robert Parker. The Drops of God connection, full range tasting notes and exclusive HK pricing.",
  },
  "morey-coffinet-2024-vintage": {
    title: "Domaine Morey-Coffinet 2024 Vintage — Burghound Review & Full Offer",
    excerpt: "Allen Meadows (Burghound) calls the 2024 Batard-Montrachet a 95-point masterpiece. Full tasting notes and exclusive HK pricing.",
  },
};

const PROMO_META: Record<string, { title: string; desc: string }> = {
  weekly: {
    title: "Weekly Offer 每週精選優惠 | Terroir & Craft HK",
    desc: "每週精選特價酒款，購買指定酒款滿 HK$1,500 即送 Château Lascombes 2017。Weekly wine specials from Terroir & Craft Hong Kong.",
  },
  saintcosme2024: {
    title: "Château de Saint Cosme 2024 Exclusive Offer | Terroir & Craft HK",
    desc: "Château de Saint Cosme Gigondas and Rhône 2024 vintage exclusive offer in Hong Kong, including Hominis Fides.",
  },
};

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const clip = (s: string, n = 300) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);
const cleanName = (p: any) => (String(p.name).includes(" - ") ? String(p.name).split(" - ").slice(1).join(" - ") : p.name);
const fullName = (p: any) => {
  let n = String(cleanName(p)).trim();
  const b = String(p.brand || "").trim();
  if (b && !n.toLowerCase().startsWith(b.toLowerCase())) n = `${b} ${n}`;
  if (p.vintage && !n.includes(String(p.vintage))) n = `${n} ${p.vintage}`;
  return n;
};
const num = (v: any) => { if (v === null || v === undefined || v === "") return undefined; const n = Number(v); return isNaN(n) ? undefined : n; };
const hk = (n: any) => `HK$${Number(n).toLocaleString("en-US")}`;
const link = (href: string, text: string) => `<a href="${esc(href)}">${esc(text)}</a>`;

interface Page {
  status: number;
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  ogType?: string;
  noindex?: boolean;
  jsonLd?: object[];
  bodyHtml: string;
}

const DEFAULT_TITLE = "Terroir & Craft | 天地人酒業 — Premium Wine Hong Kong & Macau";
const DEFAULT_DESC =
  "Terroir & Craft 天地人酒業 — Hong Kong wine importer with exclusive agency for 23 international wine brands. Shop wine online with delivery in Hong Kong & Macau. AI Sommelier available.";

function productJsonLd(p: any, url: string, image?: string) {
  const price = num(p.promo_price) ?? num(p.price);
  const r = p.ratings?.[0];
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: `${p.brand} ${cleanName(p)}${p.vintage ? " " + p.vintage : ""}`,
    image: image ? [image] : [],
    description: p.tasting_note || p.tasting_notes || productMetaDesc({ ...p, price: num(p.price) }),
    brand: { "@type": "Brand", name: p.brand },
    sku: p.id,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "HKD",
      price: String(price ?? ""),
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Terroir & Craft" },
    },
    ...(r ? { review: { "@type": "Review", reviewRating: { "@type": "Rating", ratingValue: String(r.score), bestRating: String(r.maxScore || 100) }, author: { "@type": "Organization", name: r.source } } } : {}),
  };
}

function orgJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      alternateName: ["Terroir and Craft", "天地人酒業", "Terroir & Craft Hong Kong"],
      url: BASE_URL,
      logo: `${BASE_URL}/brand-logos/terroir-craft.png`,
      email: "eshop@terroirandcraft.com",
      telephone: "+852-9805-5609",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Room 509, 5/F, Seaview Centre, 139 Hoi Bun Road, Kwun Tong",
        addressLocality: "Hong Kong",
        addressCountry: "HK",
      },
    },
    { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: BASE_URL },
  ];
}

export function buildPage(urlPath: string, query: Record<string, any>, products: any[]): Page {
  const parts = urlPath.split("/").filter(Boolean);
  const top = parts[0] || "";
  const noindex = NOINDEX_TOP.has(top);

  if (!KNOWN_TOP.has(top)) {
    return {
      status: 404, title: "Page not found | Terroir & Craft", description: DEFAULT_DESC, noindex: true,
      bodyHtml: `<h1>Page not found</h1><p>${link("/", "Back to Terroir & Craft home")}</p>`,
    };
  }

  const wines = products.filter((p) => p.type !== "Whisky" && p.type !== "Gin" && p.type !== "Makgeolli" && p.type !== "Supplement");
  const brands = Array.from(new Set(products.map((p) => p.brand))).sort();
  const productList = (list: any[]) =>
    `<ul>${list.map((p) => `<li>${link(`/wines/${p.id}`, fullName(p))} — ${hk(num(p.promo_price) ?? num(p.price))}</li>`).join("")}</ul>`;
  const uniq = (a: any[]) => Array.from(new Set(a.filter(Boolean).map(String)));
  const brandIntro = (brand: string, list: any[]) => {
    const regions = uniq(list.map((p) => p.region)), countries = uniq(list.map((p) => p.country)), types = uniq(list.map((p) => p.type)), grapes = uniq(list.map((p) => p.grape));
    return `<p>${esc(brand)}${countries.length ? ` is a producer from ${esc(countries.join(", "))}${regions.length ? ` (${esc(regions.join(", "))})` : ""}` : ""} represented in Hong Kong and Macau by Terroir & Craft 天地人酒業. ` +
      `${list.length} ${list.length === 1 ? "wine is" : "wines are"} currently available to order online${types.length ? `: ${esc(types.join(", "))}` : ""}${grapes.length ? `, made from ${esc(grapes.join(", "))}` : ""}. ` +
      `Free delivery over HK$1,000 in Hong Kong and HK$2,500 in Macau.</p>`;
  };
  const brandDetails = (list: any[]) =>
    `<ul>${list.map((p) => {
      const pr = num(p.promo_price) ?? num(p.price);
      const bits = [p.type, p.grape, p.region, p.country].filter(Boolean).map(esc).join(" · ");
      const note = p.tasting_note || p.tasting_notes || "";
      return `<li>${link(`/wines/${p.id}`, `${fullName(p)}`)}${pr ? ` — ${hk(pr)}` : ""}${bits ? `<br>${bits}` : ""}${note ? `<br>${esc(clip(String(note), 220))}` : ""}${p.food_pairing ? `<br>Food pairing: ${esc(p.food_pairing)}` : ""}</li>`;
    }).join("")}</ul>`;
  const brandList = `<ul>${brands.map((b) => `<li>${link(`/brands/${encodeURIComponent(b)}`, `${b} wines`)}</li>`).join("")}</ul>`;

  // ── Product ──
  if (top === "wines" && parts[1]) {
    const p = products.find((x) => x.id === decodeURIComponent(parts[1]));
    if (!p) {
      return { status: 404, title: "Wine not found | Terroir & Craft", description: DEFAULT_DESC, noindex: true,
        bodyHtml: `<h1>Wine not found</h1><p>${link("/wines", "Browse all wines")}</p>` };
    }
    const url = `${BASE_URL}/wines/${p.id}`;
    const image = p.image_url ? `${BASE_URL}${String(p.image_url).split("?")[0]}` : undefined;
    const pp = { ...p, price: num(p.price) };
    const title = productTitle(pp);
    const desc = productMetaDesc(pp);
    const sale = num(p.promo_price);
    const rows = [
      ["Region", p.region], ["Country", p.country], ["Grape", p.grape], ["Type", p.type],
      ["Vintage", p.vintage], ["Bottle size", p.size], ["Food pairing", p.food_pairing],
    ].filter((r) => r[1]);
    return {
      status: 200, title, description: desc, canonical: url, image, ogType: "product",
      jsonLd: [productJsonLd(p, url, image)],
      bodyHtml:
        `<nav>${link("/", "Home")} / ${link("/wines", "Wines")} / ${link(`/brands/${encodeURIComponent(p.brand)}`, p.brand)}</nav>` +
        `<h1>${esc(fullName(p))}</h1>` +
        `<p>${sale && sale < num(p.price)! ? `${hk(sale)} (regular ${hk(num(p.price))})` : hk(num(p.price))}</p>` +
        `<p>${esc(p.tasting_note || p.tasting_notes || "")}</p>` +
        `<ul>${rows.map((r) => `<li>${esc(r[0])}: ${esc(r[1])}</li>`).join("")}</ul>` +
        (p.ratings?.length ? `<p>Ratings: ${p.ratings.map((r: any) => `${esc(r.source)} ${esc(r.score)}`).join(", ")}</p>` : "") +
        `<p>Terroir & Craft 天地人酒業 — delivery in Hong Kong and Macau.</p>`,
    };
  }

  // ── Brand ──
  if (top === "brands" && parts[1]) {
    const raw = decodeURIComponent(parts[1]);
    const brand = brands.find((b) => b.toLowerCase() === raw.toLowerCase()) || raw;
    const list = products.filter((p) => p.brand === brand);
    return {
      status: 200, title: brandTitle(brand),
      description: `${brand} wines available in Hong Kong from Terroir & Craft — exclusive HK agency. Shop ${brand} online with free delivery over HK$1,000.`,
      canonical: `${BASE_URL}/brands/${encodeURIComponent(brand)}`,
      bodyHtml: `<h1>${esc(brand)} — Hong Kong</h1>${brandIntro(brand, list)}${list.length ? brandDetails(list) : ""}<p>${link("/brands", "All brands")}</p>`,
    };
  }

  if (top === "brands") {
    return { status: 200, title: "Wine Brands — Exclusive HK Agency | Terroir & Craft 天地人酒業",
      description: "Browse the exclusive wine brands represented in Hong Kong by Terroir & Craft: Mollydooker, Realm Cellars, Château de Saint Cosme, Boizel, Morey-Coffinet, Kopke, Tscharke, Sherwood and more.",
      canonical: `${BASE_URL}/brands`, bodyHtml: `<h1>Wine brands</h1>${brandList}` };
  }

  if (top === "wines") {
    return { status: 200, title: "Shop Wine Online in Hong Kong | Terroir & Craft 天地人酒業",
      description: `Shop ${wines.length}+ wines online in Hong Kong and Macau: Burgundy, Rhône, Bordeaux, Champagne, Australia and New Zealand. Exclusive agency brands, free delivery over HK$1,000.`,
      canonical: `${BASE_URL}/wines`, bodyHtml: `<h1>Wines</h1>${productList(wines)}` };
  }

  if (top === "spirits") {
    const sp = products.filter((p) => !wines.includes(p));
    return { status: 200, title: "Spirits, Whisky & Others | Terroir & Craft 天地人酒業",
      description: "Whisky, gin, makgeolli and other spirits from Terroir & Craft, Hong Kong.",
      canonical: `${BASE_URL}/spirits`, bodyHtml: `<h1>Spirits &amp; Others</h1>${productList(sp)}` };
  }

  if (top === "promotions") {
    const id = parts[1];
    const m = id ? PROMO_META[id] : undefined;
    const list = id ? products.filter((p) => Array.isArray(p.promotions) ? p.promotions.includes(id) : p.promotion === id) : products.filter((p) => num(p.promo_price));
    return {
      status: 200,
      title: m?.title || "Wine Promotions & Special Offers | Terroir & Craft 天地人酒業",
      description: m?.desc || "Current wine promotions and special offers from Terroir & Craft, Hong Kong.",
      canonical: `${BASE_URL}/promotions${id ? "/" + id : ""}`,
      bodyHtml: `<h1>${esc(m?.title?.split("|")[0].trim() || "Promotions")}</h1>${productList(list)}`,
    };
  }

  if (top === "new-arrivals") {
    return { status: 200, title: "New Arrivals — Latest Wines | Terroir & Craft 天地人酒業",
      description: "Newly arrived wines in Hong Kong from Terroir & Craft.", canonical: `${BASE_URL}/new-arrivals`,
      bodyHtml: `<h1>New arrivals</h1>${productList(products.slice(-40))}` };
  }

  if (top === "about") {
    return { status: 200, title: "About Terroir & Craft 天地人酒業 — Hong Kong Wine Importer",
      description: "Terroir & Craft 天地人酒業 is a Hong Kong wine importer and exclusive agent for 23 wine brands, serving collectors, restaurants and retail customers in Hong Kong and Macau.",
      canonical: `${BASE_URL}/about`, jsonLd: orgJsonLd(),
      bodyHtml: `<h1>About Terroir & Craft 天地人酒業</h1><p>Hong Kong wine importer with exclusive agency brands from France, Australia, New Zealand, Germany and Portugal. Room 509, 5/F, Seaview Centre, 139 Hoi Bun Road, Kwun Tong. eshop@terroirandcraft.com</p>` };
  }

  if (top === "blog") {
    const slug = parts[1];
    const b = slug ? BLOG[slug] : undefined;
    if (b) {
      return { status: 200, title: `${b.title} | Wine Blog — Terroir & Craft HK`, description: b.excerpt,
        canonical: `${BASE_URL}/blog/${slug}`, ogType: "article", bodyHtml: `<h1>${esc(b.title)}</h1><p>${esc(b.excerpt)}</p>` };
    }
    return { status: 200, title: "Wine Blog 酒識 | Terroir & Craft HK", description: "Wine articles, vintage reviews and producer stories from Terroir & Craft Hong Kong.",
      canonical: `${BASE_URL}/blog`,
      bodyHtml: `<h1>Wine blog</h1><ul>${Object.entries(BLOG).map(([s, v]) => `<li>${link(`/blog/${s}`, v.title)}</li>`).join("")}</ul>` };
  }

  if (top === "sommelier") {
    return { status: 200, title: "AI Sommelier 蘇文 — Wine Recommendations | Terroir & Craft HK",
      description: "Ask 蘇文, the Terroir & Craft AI Sommelier, for wine recommendations in Cantonese or English.", canonical: `${BASE_URL}/sommelier`,
      bodyHtml: `<h1>AI Sommelier 蘇文</h1><p>Ask for wine recommendations by occasion, food pairing or budget.</p>` };
  }

  if (top === "fine-rare") {
    return { status: 200, title: "Fine & Rare Wine | Terroir & Craft 天地人酒業",
      description: "Fine and rare wine sourcing and advisory in Hong Kong from Terroir & Craft.", canonical: `${BASE_URL}/fine-rare`,
      bodyHtml: `<h1>Fine &amp; Rare wine</h1>` };
  }

  if (top === "occasion") {
    return { status: 200, title: "Wine by Occasion — Gifts, BBQ, Hotpot | Terroir & Craft HK",
      description: "Find the right wine for the occasion: gifts, easy-drinking reds, BBQ, hotpot and staff picks.", canonical: `${BASE_URL}/occasion`,
      bodyHtml: `<h1>Wine by occasion</h1>` };
  }

  if (top === "terms") {
    return { status: 200, title: "Terms & Conditions | Terroir & Craft 天地人酒業", description: "Terms and conditions of Terroir & Craft.", canonical: `${BASE_URL}/terms`, bodyHtml: `<h1>Terms &amp; Conditions</h1>` };
  }

  if (top === "") {
    return {
      status: 200, title: DEFAULT_TITLE, description: DEFAULT_DESC, canonical: `${BASE_URL}/`, jsonLd: orgJsonLd(),
      bodyHtml:
        `<h1>Terroir & Craft 天地人酒業 — Wine importer in Hong Kong &amp; Macau</h1>` +
        `<p>Exclusive agency for 23 international wine brands. Shop wine online with delivery across Hong Kong and Macau; free delivery over HK$1,000 (Hong Kong) / HK$2,500 (Macau).</p>` +
        `<h2>Brands</h2>${brandList}<h2>Shop</h2><p>${link("/wines", "All wines")} · ${link("/promotions", "Promotions")} · ${link("/promotions/weekly", "Weekly Offer")} · ${link("/new-arrivals", "New arrivals")} · ${link("/sommelier", "AI Sommelier")}</p>`,
    };
  }

  // cart / member / admin / payment-result / reset-password
  return { status: 200, title: DEFAULT_TITLE, description: DEFAULT_DESC, noindex: true, bodyHtml: "" };
}

export function renderHtml(template: string, page: Page, urlPath: string): string {
  const canonical = page.canonical;
  const image = page.image || DEFAULT_IMAGE;
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`);
  html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(clip(page.description, 300))}" />`);
  html = html.replace(/<meta property="og:title"[^>]*>/, "");
  html = html.replace(/<meta property="og:description"[^>]*>/, "");
  html = html.replace(/<meta property="og:type"[^>]*>/, "");

  const tags = [
    canonical ? `<link rel="canonical" href="${esc(canonical)}" />` : "",
    page.noindex || page.status === 404 ? `<meta name="robots" content="noindex, follow" />` : "",
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(clip(page.description, 300))}" />`,
    `<meta property="og:type" content="${page.ogType || "website"}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:url" content="${esc(canonical || BASE_URL + urlPath)}" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:locale" content="zh_HK" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(clip(page.description, 300))}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    ...(page.jsonLd || []).map((j, i) => `<script type="application/ld+json" id="${i === 0 ? "page-jsonld" : "page-jsonld-" + i}">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`),
  ].filter(Boolean).join("\n    ");
  html = html.replace("</head>", `    ${tags}\n  </head>`);

  if (page.bodyHtml) {
    const seo = `<div id="seo-content" aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap">${page.bodyHtml}</div>`;
    html = html.replace('<div id="root"></div>', `${seo}\n    <div id="root"></div>`);
  }
  return html;
}
