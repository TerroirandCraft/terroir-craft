import { Link } from "wouter";
import { navigate } from "wouter/use-hash-location";
import WorldMap from "@/components/WorldMap";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, API_BASE } from "@/lib/queryClient";
import { ArrowRight, Bot, Globe, Star, Package, ChevronRight, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WineCard from "@/components/WineCard";
import type { Product } from "@/lib/products";
import { BRAND_INFO } from "@/lib/products";

// Region explorer data — 10 countries in our catalogue
const REGIONS = [
  {
    country: "France",
    label: "France",
    labelZh: "法國",
    count: 37,
    flag: "fr",
    flagEmoji: "🇫🇷",
    gradient: "linear-gradient(145deg, hsl(355,55%,28%) 0%, hsl(355,70%,18%) 50%, hsl(220,30%,25%) 100%)",
  },
  {
    country: "Australia",
    label: "Australia",
    labelZh: "澳洲",
    count: 28,
    flag: "au",
    flagEmoji: "🇦🇺",
    gradient: "linear-gradient(145deg, hsl(25,65%,35%) 0%, hsl(20,55%,22%) 50%, hsl(10,40%,18%) 100%)",
  },
  {
    country: "Portugal",
    label: "Portugal",
    labelZh: "葡萄牙",
    count: 12,
    flag: "pt",
    flagEmoji: "🇵🇹",
    gradient: "linear-gradient(145deg, hsl(140,40%,28%) 0%, hsl(140,45%,18%) 50%, hsl(355,40%,20%) 100%)",
  },
  {
    country: "USA",
    label: "USA",
    labelZh: "美國",
    count: 11,
    flag: "us",
    flagEmoji: "🇺🇸",
    gradient: "linear-gradient(145deg, hsl(210,60%,28%) 0%, hsl(220,55%,18%) 50%, hsl(0,40%,22%) 100%)",
  },
  {
    country: "Germany",
    label: "Germany",
    labelZh: "德國",
    count: 9,
    flag: "de",
    flagEmoji: "🇩🇪",
    gradient: "linear-gradient(145deg, hsl(40,15%,30%) 0%, hsl(0,0%,20%) 50%, hsl(0,55%,18%) 100%)",
  },
  {
    country: "New Zealand",
    label: "New Zealand",
    labelZh: "紐西蘭",
    count: 5,
    flag: "nz",
    flagEmoji: "🇳🇿",
    gradient: "linear-gradient(145deg, hsl(160,40%,26%) 0%, hsl(170,50%,18%) 50%, hsl(200,35%,20%) 100%)",
  },
  {
    country: "Korea",
    label: "Korea",
    labelZh: "韓國",
    count: 4,
    flag: "kr",
    flagEmoji: "🇰🇷",
    gradient: "linear-gradient(145deg, hsl(0,55%,30%) 0%, hsl(210,50%,22%) 50%, hsl(0,5%,18%) 100%)",
  },
  {
    country: "Spain",
    label: "Spain",
    labelZh: "西班牙",
    count: 3,
    flag: "es",
    flagEmoji: "🇪🇸",
    gradient: "linear-gradient(145deg, hsl(35,70%,32%) 0%, hsl(0,55%,22%) 50%, hsl(35,40%,16%) 100%)",
  },
  {
    country: "South Africa",
    label: "South Africa",
    labelZh: "南非",
    count: 1,
    flag: "za",
    flagEmoji: "🇿🇦",
    gradient: "linear-gradient(145deg, hsl(120,35%,25%) 0%, hsl(60,40%,20%) 50%, hsl(0,55%,18%) 100%)",
  },
  {
    country: "Italy",
    label: "Italy",
    labelZh: "意大利",
    count: 2,
    flag: "it",
    flagEmoji: "🇮🇹",
    gradient: "linear-gradient(145deg, hsl(0,60%,30%) 0%, hsl(125,35%,22%) 50%, hsl(0,5%,18%) 100%)",
  },
  {
    country: "_hydrodol",  // sentinel — not a country, routes to ?brand=Hydrodol
    label: "Hydrodol",
    labelZh: "健康補充品",
    count: 11,
    flag: "💊",
    gradient: "linear-gradient(145deg, hsl(300,70%,28%) 0%, hsl(185,75%,22%) 50%, hsl(270,60%,18%) 100%)",
    isBrand: true,
  },
];

const SERVICES = [
  {
    icon: Package,
    title: "Import & Wholesale",
    titleZh: "進口及批發",
    desc: "Exclusive agency for 23 premium international wine brands — France, Australia, USA, Portugal and beyond.",
  },
  {
    icon: Star,
    title: "Fine Wine Investment",
    titleZh: "名莊酒投資",
    desc: "Professional advisory for rare and fine wine investment, assisting clients in selecting wines for capital appreciation.",
  },
  {
    icon: Globe,
    title: "Wine Authentication",
    titleZh: "鑑定服務",
    desc: "Objective, professional appraisal opinions backed by our exclusive comparative database.",
  },
];

// Row 1 (hero brands — must appear first)
const FEATURED_BRANDS_ROW1 = [
  { name: "Mollydooker",              logo: "Mollydooker.webp" },
  { name: "Chateau de Saint Cosme",   logo: "Chateau de Saint Cosme.jpg" },
  { name: "Realm Cellars",            logo: "Realm Cellars.webp" },
  { name: "Maison Morey-Coffinet",    logo: "Morey Coffinet.png" },
  { name: "Champagne Boizel",         logo: "Champagne Boizel.jpeg" },
];

// Row 2 (remaining exclusive brands)
const FEATURED_BRANDS_ROW2 = [
  { name: "Kopke",                    logo: "Kopke.png" },
  { name: "Vereinigte Hospitien",     logo: "Vereinigte Hospitien.webp" },
  { name: "Tscharke",                 logo: "Tscharke.png" },
  { name: "Hydrodol",                 logo: "Hydrodol.jpg" },
  { name: "Sherwood",                 logo: "Sherwood.jpg" },
  { name: "Tierra de Cubas",          logo: "Tierra de Cubas.png" },
];

const SOCIAL_POSTS = [
  {
    platform: "Instagram",
    handle: "@terroirandcraft",
    url: "https://www.instagram.com/terroirandcraft",
    caption: "New arrival: Kopke Colheita 1937 🍷 One of the world's rarest Port wines, direct from the Douro Valley.",
    type: "Red",
    accent: "from-pink-500 to-purple-600",
  },
  {
    platform: "Facebook",
    handle: "Terroir & Craft",
    url: "https://www.facebook.com/terroirandcraft",
    caption: "Morey Coffinet Chassagne-Montrachet — pure Burgundy elegance. Available now in our online store.",
    type: "White",
    accent: "from-blue-600 to-blue-800",
  },
  {
    platform: "Threads",
    handle: "@terroirandcraft",
    url: "https://www.threads.net/@terroirandcraft",
    caption: "Realm Cellars The Bard 2022 — cult Napa at its finest. Limited allocation available for HK.",
    type: "Red",
    accent: "from-gray-700 to-gray-900",
  },
];

export default function HomePage() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Staff Picks: from /api/occasions/staffpicks
  const { data: staffPickProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/occasions/staffpicks"],
  });
  const featured = staffPickProducts.slice(0, 8);

  const brandCounts: Record<string, number> = {};
  products.forEach(p => { brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1; });

  return (
    <div>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden" style={{ minHeight: "clamp(500px, 75vh, 760px)", display: "flex", alignItems: "center" }}>
        {/* Background photo */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600&q=80&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(26,13,16,0.92) 0%, rgba(26,13,16,0.65) 55%, rgba(26,13,16,0.25) 100%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full" style={{ paddingBottom: "6rem" }}>
          <div className="max-w-2xl">
            <p className="font-body text-xs tracking-[0.18em] uppercase mb-5 flex items-center gap-3" style={{ color: "#c9a05a" }}>
              <span style={{ display: "inline-block", width: 28, height: 1, background: "#c9a05a" }} />
              Hong Kong's Curated Wine Merchant
            </p>
            <h1 className="font-display font-light leading-tight mb-6" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", color: "#f5ede8" }}>
              Find the right bottle<br />
              for tonight &mdash; or<br />
              <em className="italic" style={{ color: "#e8d4c0" }}>the one worth keeping.</em>
            </h1>
            <p className="font-body text-base leading-relaxed mb-10 max-w-xl" style={{ color: "rgba(245,237,232,0.72)" }}>
              From approachable everyday wines to collectible fine bottles, Terroir &amp; Craft brings together importer-selected wines for drinking, gifting, and collecting in Hong Kong.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/wines">
                <Button
                  size="lg"
                  className="px-8 font-body font-medium border-0 text-white"
                  style={{ background: "#9a7940" }}
                  data-testid="hero-shop-btn"
                >
                  Shop Wines
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/sommelier">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 font-body font-medium backdrop-blur-sm"
                  style={{ borderColor: "rgba(245,237,232,0.3)", color: "rgba(245,237,232,0.85)" }}
                  data-testid="hero-sommelier-btn"
                >
                  <Bot className="mr-2 w-4 h-4" />
                  Ask AI Sommelier
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" style={{ zIndex: 2 }} />


      </section>

      {/* ─── SHOP BY OCCASION ─── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-[hsl(355,62%,28%)] mb-3">Shop by Occasion</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-foreground">
              Find the Perfect Bottle
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              {
                label: "Gifts",
                labelZh: "送禮之選",
                img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80&auto=format&fit=crop",
                occasion: "gifts",
              },
              {
                label: "Under HK$300",
                labelZh: "包括 Promotion 價低於 HK$300",
                img: "https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=800&q=80&auto=format&fit=crop",
                occasion: "under300",
              },
              {
                label: "Easy-Drinking Reds",
                labelZh: "Smooth, juicy and approachable",
                img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80&auto=format&fit=crop",
                occasion: "easyreds",
                overlay: "linear-gradient(to top, rgba(50,15,15,0.88) 0%, rgba(50,15,15,0.25) 60%, rgba(50,15,15,0.0) 100%)",
              },
              {
                label: "Champagne & Sparkling",
                labelZh: "Celebrate with fine bubbles",
                img: `${API_BASE}/champagne-boizel.jpg`,
                occasion: "champagne",
                overlay: "linear-gradient(to top, rgba(8,6,3,0.88) 0%, rgba(8,6,3,0.25) 60%, rgba(8,6,3,0.0) 100%)",
              },
              {
                label: "Staff Picks",
                labelZh: "Our current top picks",
                img: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800&q=80&auto=format&fit=crop",
                occasion: "staffpicks",
                overlay: "linear-gradient(to top, rgba(8,20,28,0.90) 0%, rgba(8,20,28,0.3) 60%, rgba(8,20,28,0.0) 100%)",
              },
              {
                label: "HK Hotpot 打邊爐",
                labelZh: "火鍋配酒",
                img: `${API_BASE}/hotpot.jpg`,
                occasion: "hotpot",
              },
              {
                label: "BBQ & Grill",
                labelZh: "BBQ 燒烤配酒",
                img: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80&auto=format&fit=crop",
                occasion: "bbq",
              },
            ].map((cat: any) => (
              <Link key={cat.label} href={`/wines?occasion=${cat.occasion}`}>
                <a className="relative group rounded-xl overflow-hidden block aspect-[4/3] cursor-pointer">
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${cat.img}')` }}
                  />
                  {/* Overlay — custom per card or default */}
                  <div
                    className="absolute inset-0 transition-all duration-300"
                    style={{ background: cat.overlay || "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.28) 60%, rgba(0,0,0,0.0) 100%)" }}
                  />
                  {/* Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-display text-xl text-white font-light leading-tight">{cat.label}</h3>
                    <p className="font-body text-xs mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>{cat.labelZh}</p>
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BRANDS LOGO GRID ─── */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-[hsl(355,62%,28%)] mb-3">Exclusive Agency</p>
            <h2 className="font-display text-3xl font-light text-foreground">Our Brands</h2>
          </div>

          {/* Row 1 — hero brands, larger */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-4">
            {FEATURED_BRANDS_ROW1.map(({ name, logo }) => (
              <Link key={name} href="/brands">
                <a className="group flex items-center justify-center bg-white rounded-2xl border border-border hover:border-[hsl(355,62%,28%)]/50 hover:shadow-md transition-all duration-200 p-5 h-28">
                  <img
                    src={`${API_BASE}/brand-logos/${encodeURIComponent(logo)}`}
                    alt={name}
                    className="max-h-16 max-w-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </a>
              </Link>
            ))}
          </div>

          {/* Row 2 — remaining brands */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-10">
            {FEATURED_BRANDS_ROW2.map(({ name, logo }) => (
              <Link key={name} href="/brands">
                <a className="group flex items-center justify-center bg-white rounded-2xl border border-border hover:border-[hsl(355,62%,28%)]/50 hover:shadow-md transition-all duration-200 p-5 h-28">
                  <img
                    src={`${API_BASE}/brand-logos/${encodeURIComponent(logo)}`}
                    alt={name}
                    className="max-h-14 max-w-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </a>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/brands">
              <Button variant="outline" className="font-body">
                View All 23 Brands <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── WHY TERROIR & CRAFT ─── */}
      <section className="py-20 bg-muted/30 border-t border-border border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-[hsl(355,62%,28%)] mb-3">Why Terroir &amp; Craft</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-foreground">
              The Difference You Can Taste
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-[hsl(355,62%,28%)]">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4" strokeLinecap="round"/>
                  </svg>
                ),
                title: "Curated by Importer",
                titleZh: "直接進口",
                desc: "Every bottle is personally selected. We import directly from the winery — no middlemen, better pricing, and genuine provenance guaranteed.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-[hsl(355,62%,28%)]">
                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: "Exclusive Agency",
                titleZh: "獨家代理",
                desc: "23 brands available exclusively through us in Hong Kong. We provide first-hand quality assurance and impeccable storage conditions from source to your door.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-[hsl(355,62%,28%)]">
                    <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: "Hong Kong Delivery",
                titleZh: "本地送貨",
                desc: "Prompt and secure delivery across Hong Kong and Macau. Free delivery on orders over HK$1,000.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-[hsl(355,62%,28%)]">
                    <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: "Everyday to Rare",
                titleZh: "日常至珍稀",
                desc: "Approachable weeknight bottles alongside collectible fine wines. One curated destination for every occasion and every level of wine enthusiasm.",
              },
            ].map((item, i) => (
              <div key={i} className="px-8 py-6 md:py-0 first:pl-0 last:pr-0">
                <div className="mb-4">{item.icon}</div>
                <h3 className="font-body text-base font-semibold text-foreground mb-0.5">{item.title}</h3>
                <p className="font-body text-xs text-muted-foreground mb-3">{item.titleZh}</p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

            {/* ─── ABOUT STRIP ─── */}
      <section className="bg-[hsl(355,62%,28%)] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="font-body text-xs tracking-[0.2em] uppercase text-white/60 mb-4">About Us 關於我們</p>
            <h2 className="font-display text-3xl md:text-4xl font-light mb-6 leading-tight">
              The Art of<br />
              <em className="italic">Terroir & Craft</em>
            </h2>
            <p className="font-body text-sm text-white/80 leading-relaxed mb-4">
              Winemaking is an art that combines nature and culture. The harmonious resonance of "Terroir and Craft" 
              is the key to creating a fine wine — a respect for nature, culture, and craftsmanship.
            </p>
            <p className="font-body text-sm text-white/80 leading-relaxed mb-8">
              We meticulously select each bottle to provide a comprehensive range of wine options and professional 
              services for wine enthusiasts, collectors, and catering industry clients in Hong Kong and Macau.
            </p>
            <Link href="/about">
              <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 font-body">
                Learn More
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Exclusive Importers", desc: "Direct from winery, no middlemen" },
              { label: "23 Brands", desc: "Handpicked from 10 countries" },
              { label: "Fine Wine Advisory", desc: "Investment & authentication" },
              { label: "HK & Macau", desc: "Prompt and secure delivery" },
            ].map(item => (
              <div key={item.label} className="bg-white/10 rounded-lg p-5">
                <div className="font-display text-base font-medium mb-1">{item.label}</div>
                <div className="font-body text-xs text-white/60">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED WINES ─── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-[hsl(355,62%,28%)] mb-3">Featured 精選</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-foreground">
                Staff Picks
              </h2>
            </div>
            <Link href="/wines">
              <Button variant="ghost" className="text-[hsl(355,62%,28%)] hover:text-[hsl(355,62%,22%)] font-body">
                View All <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden">
                  <div className="skeleton h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map(product => (
                <WineCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── AI SOMMELIER CTA ─── */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[hsl(355,62%,28%)]/10 flex items-center justify-center mx-auto mb-6">
            <Bot className="w-8 h-8 text-[hsl(355,62%,28%)]" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-light mb-4">
            Meet Your AI Sommelier
          </h2>
          <p className="font-body text-muted-foreground mb-8 leading-relaxed">
            Not sure which wine to choose? Our AI Sommelier knows every bottle in our collection. 
            Ask in <strong>Cantonese or English</strong> — describe your occasion, budget, or food pairing, 
            and get a personalised recommendation instantly.
          </p>
          <div className="bg-card border border-border rounded-xl p-6 mb-8 text-left">
            <div className="space-y-3">
              {[
                "「我想搵支唔超過 $500，配牛扒飲嘅紅酒」",
                '"Recommend something from Burgundy under HK$800"',
                "「有冇好飲嘅 Port Wine 做 gift？」",
              ].map((msg, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-[hsl(355,62%,28%)]/15 flex items-center justify-center">
                    <span className="text-xs text-[hsl(355,62%,28%)]">✦</span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground italic">{msg}</p>
                </div>
              ))}
            </div>
          </div>
          <Link href="/sommelier">
            <Button
              size="lg"
              className="bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body px-10"
              data-testid="home-sommelier-cta"
            >
              <Bot className="mr-2 w-5 h-5" />
              Chat with AI Sommelier
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── FOR TRADE ─── */}
      <section className="py-20 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-[hsl(355,62%,28%)] mb-4">For Trade</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-foreground mb-6 leading-tight">
                Supplying restaurants, bars,<br />and hospitality partners<br />in Hong Kong
              </h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
                We work with fine dining restaurants, boutique hotels, wine bars, and corporate clients across Hong Kong and Macau. Our portfolio offers exclusive labels, flexible ordering, and dedicated account management.
              </p>
              <Link href="/about">
                <Button className="bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body">
                  Contact Us
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Exclusive Labels", desc: "Differentiate your list with brands only available through us in HK & Macau.", icon: "🏷️" },
                { title: "Reliable Supply", desc: "Direct import ensures consistent stock and competitive lead times.", icon: "📦" },
                { title: "First-Hand Quality", desc: "Impeccable storage from source to cellar — we guarantee condition.", icon: "✓" },
                { title: "Staff Education", desc: "Producer tastings and staff training sessions available on request.", icon: "🎓" },
              ].map((f, i) => (
                <div key={i} className="bg-muted/40 rounded-xl p-5 border border-border">
                  <div className="text-lg mb-2">{f.icon}</div>
                  <h4 className="font-body text-sm font-semibold text-foreground mb-1">{f.title}</h4>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MEMBER JOIN ─── */}
      <section className="py-16 bg-[hsl(355,62%,28%)]/5 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-[hsl(355,62%,28%)] mb-3">Member Club</p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-foreground mb-4">
            Join & Earn Rewards
          </h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
            Join our member club for exclusive benefits: earn points with every purchase, enjoy member-only offers, and get early access to new arrivals and limited bottles.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {["Welcome +50 pts", "每 HK$5 賺 1 積分", "首單 +100 pts", "Silver / Gold / Platinum"].map(b => (
              <span key={b} className="font-body text-xs px-4 py-1.5 rounded-full bg-[hsl(355,62%,28%)]/10 text-[hsl(355,62%,28%)] border border-[hsl(355,62%,28%)]/20">
                {b}
              </span>
            ))}
          </div>
          <Link href="/member">
            <Button className="bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body px-10">
              Join Now 立即登記
            </Button>
          </Link>
        </div>
      </section>

            {/* ─── SOCIAL MEDIA ─── */}
      <section className="py-16 bg-muted/20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-[hsl(355,62%,28%)] mb-3">Follow Our Journey</p>
            <h2 className="font-display text-3xl font-light mb-2">Stay Connected</h2>
            <p className="font-body text-sm text-muted-foreground">
              Follow us on Instagram for new arrivals, tasting notes, and exclusive offers.
            </p>
          </div>

          {/* Instagram card only */}
          <div className="max-w-md mx-auto mb-8">
            {SOCIAL_POSTS.filter(p => p.platform === "Instagram").map(post => (
              <a
                key={post.platform}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card border border-border rounded-xl p-6 card-hover block group"
                data-testid="social-card-instagram"
              >
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${post.accent} text-white text-xs font-body font-medium mb-4`}>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  {post.platform}
                </div>
                <p className="font-body text-sm text-foreground leading-relaxed mb-4 group-hover:text-[hsl(355,62%,28%)] transition-colors">
                  "{post.caption}"
                </p>
                <p className="font-body text-xs text-muted-foreground">{post.handle}</p>
              </a>
            ))}
          </div>

          <div className="flex justify-center">
            <a
              href="https://www.instagram.com/terroirandcraft"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-body font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 transition-opacity"
              data-testid="follow-instagram"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Follow on Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}