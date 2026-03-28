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
  { name: "Crystallum",               logo: "Crystallum.png" },
  { name: "Château d'Issan",          logo: "Chateau D'Issan.png" },
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

  // Featured: mix of types, best value
  const featured = products
    .filter(p => ["Mollydooker", "Chateau de Saint Cosme", "Morey Coffinet", "Kopke", "Champagne Boizel"].includes(p.brand))
    .filter(p => p.price > 0 && p.price < 1000)
    .slice(0, 8);

  const brandCounts: Record<string, number> = {};
  products.forEach(p => { brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1; });

  return (
    <div>
      {/* ─── HERO ─── */}
      <section
        className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(20,12%,10%) 0%, hsl(355,50%,15%) 60%, hsl(355,62%,22%) 100%)",
        }}
      >
        {/* Decorative vine texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <p className="font-body text-sm tracking-[0.25em] uppercase text-white/60 mb-6">
            Terroir & Craft 天地人酒業
          </p>
          <h1 className="font-display font-light text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
            Every Bottle,<br />
            <em className="italic text-[hsl(355,60%,70%)]">a Better Story!</em>
          </h1>
          <p className="font-body text-base md:text-lg text-white/70 max-w-2xl mx-auto mb-3 leading-relaxed">
            We source from mindful wineries that put quality, people and planet first.
          </p>
          <p className="font-body text-sm md:text-base text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed">
            For wine lovers who enjoy exploring new regions and building a fine-wine cellar with purpose.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/wines">
              <Button
                size="lg"
                className="bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white border-0 px-8 font-body font-medium"
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
                className="border-white/30 text-white hover:bg-white/10 px-8 font-body font-medium backdrop-blur-sm"
                data-testid="hero-sommelier-btn"
              >
                <Bot className="mr-2 w-4 h-4" />
                Ask AI Sommelier
              </Button>
            </Link>
          </div>


        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
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

          {/* Row 2 — remaining brands, slightly smaller */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 mb-10">
            {FEATURED_BRANDS_ROW2.map(({ name, logo }) => (
              <Link key={name} href="/brands">
                <a className="group flex items-center justify-center bg-white rounded-xl border border-border hover:border-[hsl(355,62%,28%)]/50 hover:shadow-sm transition-all duration-200 p-4 h-20">
                  <img
                    src={`${API_BASE}/brand-logos/${encodeURIComponent(logo)}`}
                    alt={name}
                    className="max-h-10 max-w-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-200"
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

      {/* ─── REGION EXPLORER ─── */}
      <section className="py-16 bg-[hsl(30,15%,96%)] border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="font-body text-xs tracking-[0.25em] uppercase text-[hsl(355,62%,28%)] mb-3">Shop by Origin</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-foreground">
              Explore by Region 按產區選酒
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-3">
              Click any region to browse our exclusive selection
            </p>
          </div>

          <WorldMap />

          <div className="text-center mt-8">
            <Link href="/wines">
              <Button variant="outline" className="font-body border-[hsl(355,62%,28%)] text-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,28%)] hover:text-white">
                View All 112 Wines <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-[hsl(355,62%,28%)] mb-3">Our Services</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-foreground">
              More Than a Wine Shop
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICES.map(s => (
              <div key={s.title} className="bg-card rounded-lg p-8 border border-border card-hover">
                <div className="w-12 h-12 rounded-md bg-[hsl(355,62%,28%)]/10 flex items-center justify-center mb-5">
                  <s.icon className="w-6 h-6 text-[hsl(355,62%,28%)]" />
                </div>
                <h3 className="font-display text-xl font-medium mb-1 text-foreground">{s.title}</h3>
                <p className="font-body text-xs text-muted-foreground mb-3">{s.titleZh}</p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
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
                Editor's Picks
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

      {/* ─── SOCIAL MEDIA ─── */}
      <section className="py-16 bg-muted/20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="font-body text-xs tracking-[0.2em] uppercase text-[hsl(355,62%,28%)] mb-3">Follow Our Journey</p>
            <h2 className="font-display text-3xl font-light mb-2">Stay Connected</h2>
            <p className="font-body text-sm text-muted-foreground">
              Follow us on social media for new arrivals, tasting notes, and exclusive offers.
            </p>
          </div>

          {/* Social cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {SOCIAL_POSTS.map(post => (
              <a
                key={post.platform}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card border border-border rounded-xl p-6 card-hover block group"
                data-testid={`social-card-${post.platform.toLowerCase()}`}
              >
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${post.accent} text-white text-xs font-body font-medium mb-4`}>
                  {post.platform === "Instagram" && (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  )}
                  {post.platform === "Facebook" && (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  {post.platform === "Threads" && (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-.505-1.808-1.346-3.216-2.537-4.185-1.27-1.036-2.994-1.56-5.12-1.575-2.629.016-4.674.847-6.08 2.467-1.318 1.52-1.985 3.741-2.013 6.585.028 2.844.697 5.063 2.013 6.585 1.406 1.62 3.451 2.45 6.08 2.467.893 0 2.019-.107 2.956-.379 1.064-.308 1.97-.872 2.59-1.618.634-.764.986-1.72 1.047-2.842-.588.087-1.107.136-1.559.142-2.29.044-4.065-.564-5.277-1.807-.697-.71-1.136-1.66-1.297-2.8-.148-1.051-.025-2.13.354-3.12C14.83 6.946 16.515 6 18.756 6c.27 0 .558.013.857.04l-.137-1.254-.002-.014c-.083-.695-.147-1.26-.147-1.83 0-1.015.287-1.76.878-2.278.554-.485 1.365-.721 2.39-.7l.17.005.005-.005.062.005c.814.037 1.514.264 2.077.676.55.403.946.978 1.179 1.712.136.425.19.872.16 1.333a4.3 4.3 0 0 1-.402 1.621c.463.232.827.567 1.077 1.006.25.438.37.944.354 1.498-.023.782-.301 1.468-.826 2.04-.524.57-1.251.93-2.16 1.073-.085.014-.17.026-.256.036.026.337.04.678.04 1.023 0 2.152-.567 4.047-1.686 5.631-1.131 1.6-2.747 2.77-4.807 3.48C21.002 23.656 19.7 24 17.5 24h-5.314z" />
                    </svg>
                  )}
                  {post.platform}
                </div>
                <p className="font-body text-sm text-foreground leading-relaxed mb-4 group-hover:text-[hsl(355,62%,28%)] transition-colors">
                  "{post.caption}"
                </p>
                <p className="font-body text-xs text-muted-foreground">{post.handle}</p>
              </a>
            ))}
          </div>

          {/* Follow buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: "Follow on Instagram", icon: "instagram", href: "https://www.instagram.com/terroirandcraft", color: "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90" },
              { name: "Like on Facebook", icon: "facebook", href: "https://www.facebook.com/terroirandcraft", color: "bg-blue-600 text-white hover:bg-blue-700" },
              { name: "Follow on Threads", icon: "threads", href: "https://www.threads.net/@terroirandcraft", color: "bg-foreground text-background hover:opacity-80" },
            ].map(s => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-body font-medium transition-all ${s.color}`}
                data-testid={`follow-${s.icon}`}
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
