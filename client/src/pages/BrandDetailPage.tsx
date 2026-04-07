import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Globe, MapPin, Star, BookOpen, Download } from "lucide-react";
import type { Product } from "@/lib/products";
import { BRAND_INFO, formatPrice } from "@/lib/products";
import WineCard from "@/components/WineCard";
import { API_BASE } from "@/lib/queryClient";
import { getBrandConfig } from "@/lib/brandConfig";

// Local brand logo files
const BRAND_LOGO_FILES: Record<string, string> = {
  "Mollydooker":                 "Mollydooker.webp",
  "Canmak":                      "Canmak.jpeg",
  "Champagne Boizel":            "Champagne Boizel.jpeg",
  "Château d'Issan":             "Chateau D'Issan.png",
  "Château de Saint Cosme":      "Chateau de Saint Cosme.jpg",
  "Crystallum":                  "Crystallum.png",
  "Kopke":                       "Kopke.jpg",
  "La Dame de Montrose":         "La Dame de Montrose.png",
  "Le Baron de Brane":           "Le Baron de Brane.png",
  "Les Pagodes de Cos":          "Les Pagodes de Cos.jpeg",
  "Levrier Wines by Jo Irvine":  "Levrier Wines by Jo Irvine.webp",
  "Maison Morey-Coffinet":       "Morey Coffinet.png",
  "Morey-Coffinet":              "Morey Coffinet.png",
  "Pasqua":                      "Pasqua.png",
  "Realm Cellars":               "Realm Cellars.webp",
  "Sherwood":                    "Sherwood.jpg",
  "Tierra de Cubas":             "Tierra de Cubas.png",
  "Tscharke":                    "Tscharke.png",
  "Vereinigte Hospitien":        "Vereinigte Hospitien.webp",
  "Hydrodol":                    "Hydrodol.jpg",
};

function getBrandLogoSrc(brand: string): string | null {
  const file = BRAND_LOGO_FILES[brand];
  return file ? `${API_BASE}/brand-logos/${encodeURIComponent(file)}` : null;
}

export default function BrandDetailPage() {
  const { brand: brandSlug } = useParams<{ brand: string }>();
  const brand = decodeURIComponent(brandSlug || "");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const brandProducts = products.filter(
    p => p.brand.toLowerCase() === brand.toLowerCase()
  );
  const info = BRAND_INFO[brand];
  const actualBrand = brandProducts[0]?.brand || brand;
  const cfg = getBrandConfig(actualBrand);

  const byType: Record<string, Product[]> = {};
  brandProducts.forEach(p => {
    const t = p.type || "Other";
    if (!byType[t]) byType[t] = [];
    byType[t].push(p);
  });
  const typeOrder = ["Red", "White", "Sparkling", "Champagne", "Sparkling Red", "Rose", "Fortified", "Makgeolli", "Other"];
  const sortedTypes = Object.keys(byType).sort((a, b) => {
    const ai = typeOrder.indexOf(a); const bi = typeOrder.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const isLight = cfg.heroText !== "#ffffff";
  const logoSrc = getBrandLogoSrc(actualBrand);

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-muted-foreground font-body text-sm">Loading...</div>
    </div>
  );

  if (brandProducts.length === 0) return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <Link href="/brands">
          <a className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-body text-sm mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Brands
          </a>
        </Link>
        <p className="font-body text-muted-foreground">Brand not found.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ── */}
      <div style={{
        background: cfg.heroBg
          ? `url(${API_BASE}${cfg.heroBg}) center/cover no-repeat`
          : `linear-gradient(135deg, ${cfg.heroGradient.from} 0%, ${cfg.heroGradient.to} 100%)`,
        padding: "28px 0 52px",
        position: "relative",
      }}>
        {/* Dark overlay for readability when using bg image */}
        {cfg.heroBg && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.62)", pointerEvents: "none" }} />
        )}
        {/* Heritage year + tagline watermark */}
        {cfg.heritage && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "flex-end", justifyContent: "flex-end",
            padding: "32px 40px", pointerEvents: "none", zIndex: 1,
          }}>
            <div style={{
              fontFamily: `'${cfg.heritage.yearFont || "Cinzel"}', serif`,
              fontSize: "clamp(6rem,15vw,11rem)",
              fontWeight: 900,
              color: cfg.heritage.yearColor || cfg.accent,
              opacity: 0.18,
              lineHeight: 1,
              letterSpacing: "0.05em",
              userSelect: "none",
            }}>{cfg.heritage.year}</div>
          </div>
        )}
        <div className="max-w-6xl mx-auto px-4 sm:px-6" style={{ position: "relative", zIndex: 2 }}>
          {/* Back */}
          <Link href="/brands">
            <a className="inline-flex items-center gap-1.5 font-body text-sm mb-8 transition-colors"
              style={{ color: isLight ? "#6B4A20" : "rgba(255,255,255,0.6)" }}>
              <ArrowLeft className="w-4 h-4" /> All Brands
            </a>
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Logo */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border flex items-center justify-center shrink-0 overflow-hidden"
              style={{ background: isLight ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.1)", borderColor: isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)" }}>
              {logoSrc ? (
                <img src={logoSrc} alt={`${actualBrand} logo`} className="w-full h-full object-contain p-3"
                  onError={e => { e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML = `<span class="font-script text-3xl" style="color:${cfg.accent}">${actualBrand.substring(0,2)}</span>`; }} />
              ) : (
                <span className="font-script text-3xl" style={{ color: cfg.accent }}>{actualBrand.substring(0,2)}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-body text-xs font-semibold tracking-widest uppercase"
                  style={{ background: `${cfg.accent}22`, border: `1px solid ${cfg.accent}55`, color: cfg.accent }}>
                  <Star className="w-3 h-3 fill-current" /> Exclusive Agency
                </span>
              </div>
              <h1 className="font-display mb-2 leading-tight" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", color: cfg.heroText }}>
                {actualBrand}
              </h1>
              {info?.country && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-sm mb-4"
                  style={{ color: isLight ? "#6B4A20" : "rgba(255,255,255,0.6)" }}>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{info.country}</span>
                  {info.website && (
                    <a href={info.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 transition-colors hover:opacity-80"
                      style={{ color: cfg.accent }}>
                      <Globe className="w-3.5 h-3.5" /> Official Website →
                    </a>
                  )}
                </div>
              )}
              {info?.description && (
                <div className="font-body text-sm leading-relaxed max-w-2xl space-y-3"
                  style={{ color: isLight ? "#4A3010" : "rgba(255,255,255,0.8)" }}>
                  {info.description.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Heritage callout — prominent year + tagline */}
          {cfg.heritage && (
            <div className="mt-10 pt-8" style={{ borderTop: `1px solid ${cfg.accent}33` }}>
              <div style={{
                fontFamily: `'${cfg.heritage.yearFont || "Cinzel"}', serif`,
                fontSize: "clamp(3.5rem,8vw,6rem)",
                fontWeight: 900,
                color: cfg.heritage.yearColor || cfg.accent,
                lineHeight: 1,
                letterSpacing: "0.06em",
              }}>{cfg.heritage.year}</div>
              <div style={{
                fontFamily: `'${cfg.heritage.yearFont || "Cinzel"}', serif`,
                fontSize: "clamp(0.7rem,1.5vw,0.95rem)",
                fontWeight: 400,
                color: "rgba(255,255,255,0.75)",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                marginTop: 8,
              }}>{cfg.heritage.tagline}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="border-b border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap gap-5">
          <span className="font-body text-xs text-muted-foreground">
            {brandProducts.length} {actualBrand === "Hydrodol" ? "products" : "wines"} available
          </span>
          {Object.entries(byType).map(([type, items]) => (
            <span key={type} className="font-body text-xs text-muted-foreground">
              {type} <strong className="text-foreground">{items.length}</strong>
            </span>
          ))}
          <span className="font-body text-xs text-muted-foreground">
            From <strong className="text-foreground">{formatPrice(Math.min(...brandProducts.map(p => p.price).filter(p => p > 0)))}</strong>
          </span>
        </div>
      </div>

      {/* ── BOOKLET DOWNLOAD SECTION ── */}
      {cfg.booklet && (
        <section style={{ background: cfg.sectionBg, borderBottom: `1px solid ${cfg.accent}33` }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
              {/* Left: booklet cover image or icon */}
              {cfg.booklet.coverImage ? (
                <div className="shrink-0 w-44 shadow-2xl rounded-xl overflow-hidden" style={{ aspectRatio: "3/4" }}>
                  <img
                    src={`${API_BASE}${cfg.booklet.coverImage}`}
                    alt="Booklet cover"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="shrink-0 w-28 h-36 rounded-xl flex flex-col items-center justify-center shadow-lg"
                  style={{ background: cfg.accent }}>
                  <BookOpen className="w-10 h-10 text-white mb-2" />
                  <span className="font-body text-white text-xs tracking-widest uppercase text-center px-2"
                    style={{ fontSize: 10, letterSpacing: "0.2em" }}>{cfg.booklet.label}</span>
                </div>
              )}
              {/* Right: text + download */}
              <div className="flex-1">
                <p className="font-body text-xs tracking-widest uppercase mb-2" style={{ color: cfg.accent }}>
                  {cfg.booklet.label}
                </p>
                <h2 className="font-display text-2xl mb-3" style={{ color: "#1A0D08" }}>
                  {cfg.booklet.heading}
                </h2>
                <p className="font-body text-sm leading-relaxed mb-6" style={{ color: "#3A2010", maxWidth: 520 }}>
                  {cfg.booklet.description}
                </p>
                <a
                  href={`${API_BASE}${cfg.booklet.downloadUrl}`}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-body text-sm font-semibold transition-opacity hover:opacity-85"
                  style={{ background: cfg.accent, color: "#fff", letterSpacing: "0.05em" }}
                >
                  <Download className="w-4 h-4" />
                  {cfg.booklet.downloadLabel}
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── BRAND FEATURE SECTION (e.g. Mollydooker Shake) ── */}
      {cfg.feature && (
        <section style={{ background: cfg.sectionBg, padding: "64px 0" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Label + Heading — use Satisfy (font-script) */}
            <p className="font-body text-xs tracking-[0.3em] uppercase mb-3" style={{ color: cfg.accent }}>
              {cfg.feature.label}
            </p>
            <h2 className="font-script mb-10" style={{ fontSize: "clamp(2rem,4vw,2.8rem)", color: isLight ? "#2A1A08" : "#ffffff", fontStyle: "normal", fontFamily: "'Satisfy', cursive" }}>
              {cfg.feature.heading}
            </h2>

            {/* Two columns */}
            <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">
              {/* Left: real photo OR coloured box + description */}
              <div className="flex-1 min-w-0">
                {cfg.feature.image ? (
                  <div className="mb-6">
                    <img
                      src={`${API_BASE}${cfg.feature.image}`}
                      alt={cfg.feature.heading}
                      className="w-full rounded-2xl shadow-lg object-cover"
                      style={{ aspectRatio: "4/3", maxHeight: 340 }}
                    />
                    {cfg.feature.imageCaption && (
                      <p className="font-body text-xs mt-2 italic" style={{ color: isLight ? "#6B4A20" : "rgba(255,255,255,0.5)", letterSpacing: "0.05em" }}>
                        {cfg.feature.imageCaption}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="w-full rounded-2xl flex flex-col items-center justify-center py-10 px-6 mb-6"
                    style={{ background: cfg.feature.visual.bg, aspectRatio: "16/9" }}>
                    <span className="font-body text-sm text-white/70 uppercase tracking-widest mb-1">{cfg.feature.visual.line1}</span>
                    <span style={{ fontFamily: "'Satisfy', cursive", fontSize: "clamp(1.6rem,3vw,2.2rem)", color: "white" }}>
                      {cfg.feature.visual.line2}
                    </span>
                    <span className="text-4xl mt-4">🍾</span>
                  </div>
                )}
                <p className="font-body text-sm leading-relaxed" style={{ color: isLight ? "#1A0D08" : "rgba(255,255,255,0.80)", lineHeight: 1.9 }}>
                  {cfg.feature.body}
                </p>
              </div>

              {/* Right: YouTube embed (only if youtubeId provided) */}
              {cfg.feature.youtubeId && (
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs tracking-[0.25em] uppercase mb-3" style={{ color: cfg.accent }}>
                    Watch the technique
                  </p>
                  <div className="w-full overflow-hidden rounded-2xl shadow-xl" style={{ aspectRatio: "16/9" }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${cfg.feature.youtubeId}`}
                      title={cfg.feature.heading}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      style={{ border: "none", display: "block" }}
                    />
                  </div>
                  {cfg.feature.videoCaption && (
                    <p className="font-body text-xs mt-3 italic" style={{ color: "#888" }}>
                      {cfg.feature.videoCaption}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── WINE GRID ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Section heading with accent underline */}
        <div>
          <h2 className="font-display text-3xl mb-3" style={{ color: "#2A1A08" }}>Our Range</h2>
          <div className="h-0.5 w-14 rounded-full" style={{ background: cfg.accent }} />
        </div>

        {sortedTypes.map(type => (
          <section key={type}>
            <div className="flex items-center gap-3 mb-5">
              <h3 className="font-body text-xs tracking-widest uppercase" style={{ color: cfg.accent }}>
                {actualBrand === "Hydrodol" ? type : `${type} Wines`}
              </h3>
              <div className="flex-1 h-px bg-border" />
              <span className="font-body text-xs text-muted-foreground">
                {byType[type].length} {actualBrand === "Hydrodol" ? "products" : "wines"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {byType[type]
                .sort((a, b) => {
                  const av = parseInt(a.vintage) || 0;
                  const bv = parseInt(b.vintage) || 0;
                  if (bv !== av) return bv - av;
                  return a.name.localeCompare(b.name);
                })
                .map(product => (
                  <WineCard key={product.id} product={product} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
