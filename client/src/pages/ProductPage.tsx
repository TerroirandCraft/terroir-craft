import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, API_BASE } from "@/lib/queryClient";
import {
  ArrowLeft, ShoppingCart, Bot, Globe, MapPin, Calendar, Wine,
  Thermometer, Star, Play, Instagram, Facebook, ExternalLink,
  Grape, GlassWater, Clock, ChevronRight, Share2, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product, Rating, MediaLink } from "@/lib/products";
import { formatPrice, BRAND_INFO } from "@/lib/products";
import { useCart } from "@/components/CartContext";
import { useToast } from "@/hooks/use-toast";
import WineCard from "@/components/WineCard";

// ── Type colours ─────────────────────────────────────────────────────────────
const TYPE_PILL: Record<string, string> = {
  "Red":          "bg-red-50   text-red-700   border-red-200",
  "White":        "bg-amber-50 text-amber-700 border-amber-200",
  "Sparkling":    "bg-sky-50   text-sky-700   border-sky-200",
  "Champagne":    "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Rose":         "bg-pink-50  text-pink-700  border-pink-200",
  "Fortified":    "bg-orange-50 text-orange-700 border-orange-200",
  "Sparkling Red":"bg-purple-50 text-purple-700 border-purple-200",
  "Supplement":   "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
};

const BOTTLE_COLORS: Record<string, string> = {
  "Red": "#6B2233", "White": "#B89A3E", "Sparkling": "#7AAFC0",
  "Sparkling Red": "#8B2568", "Champagne": "#C4A035", "Rose": "#C46880",
  "Fortified": "#7A3B10", "Supplement": "#7A2080",
};

// ── Score badge (Watson's style — number + label) ──────────────────────────
function ScoreBadge({ source, score }: Rating) {
  const colour =
    score >= 98 ? "border-amber-400 bg-amber-50"
    : score >= 95 ? "border-[hsl(355,62%,28%)]/40 bg-[hsl(355,62%,28%)]/5"
    : "border-border bg-card";

  return (
    <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 ${colour} shrink-0`}>
      <span className="font-display text-2xl font-bold text-foreground leading-none">{score}</span>
      <span className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">{source}</span>
    </div>
  );
}

// ── SVG bottle placeholder ────────────────────────────────────────────────────
function BottleSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 280" className="h-full w-auto max-h-[420px] drop-shadow-xl" fill="none">
      {/* Capsule */}
      <rect x="41" y="8" width="18" height="28" rx="5" fill={color} opacity="0.95" />
      {/* Neck */}
      <rect x="39" y="34" width="22" height="22" rx="4" fill={color} opacity="0.9" />
      {/* Shoulder */}
      <path d="M36 56 L64 56 L72 88 L28 88 Z" fill={color} opacity="0.9" />
      {/* Body */}
      <rect x="28" y="88" width="44" height="148" rx="5" fill={color} opacity="0.9" />
      {/* Base punt */}
      <ellipse cx="50" cy="236" rx="22" ry="5" fill={color} opacity="0.7" />
      {/* Label background */}
      <rect x="32" y="120" width="36" height="60" rx="4" fill="white" opacity="0.18" />
      {/* Label lines */}
      <line x1="37" y1="136" x2="63" y2="136" stroke="white" strokeWidth="1.5" opacity="0.35" />
      <line x1="37" y1="145" x2="63" y2="145" stroke="white" strokeWidth="1" opacity="0.2" />
      <line x1="37" y1="153" x2="57" y2="153" stroke="white" strokeWidth="1" opacity="0.2" />
      <line x1="37" y1="161" x2="60" y2="161" stroke="white" strokeWidth="1" opacity="0.2" />
      {/* Shine */}
      <line x1="36" y1="65" x2="36" y2="228" stroke="white" strokeWidth="2.5" opacity="0.07" />
    </svg>
  );
}

// ── Media icon ────────────────────────────────────────────────────────────────
function MediaIcon({ type }: { type: MediaLink["type"] }) {
  if (type === "youtube") return (
    <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
      <Play className="w-4 h-4 text-white fill-white" />
    </div>
  );
  if (type === "instagram") return (
    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0">
      <Instagram className="w-4 h-4 text-white" />
    </div>
  );
  if (type === "facebook") return (
    <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
      <Facebook className="w-4 h-4 text-white" />
    </div>
  );
  return (
    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
      <ExternalLink className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
    queryFn: () => apiRequest("GET", `/api/products/${id}`).then(r => r.json()),
  });

  const { data: related = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    select: (all: Product[]) =>
      all.filter(p => p.id !== id && p.brand === product?.brand).slice(0, 4),
    enabled: !!product,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="skeleton h-[500px] rounded-2xl" />
          <div className="space-y-5 pt-4">
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-6 rounded" style={{width: `${[40,90,30,70,50][i-1]}%`}} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24 px-4">
        <p className="font-display text-3xl mb-4">Wine not found</p>
        <Link href="/wines"><Button>Back to Catalogue</Button></Link>
      </div>
    );
  }

  const bottleColor = BOTTLE_COLORS[product.type] || "#6B2233";
  const brandInfo = BRAND_INFO[product.brand];
  const cleanName = product.name.replace(product.brand + " - ", "");
  const grapeDisplay = product.grape || (product.grape_varietals?.join(", ") ?? null);
  const tastingNoteDisplay = product.tasting_note || product.tasting_notes || null;
  const pillClass = TYPE_PILL[product.type] || "bg-gray-50 text-gray-700 border-gray-200";

  const handleAdd = () => {
    addToCart(product, qty);
    toast({ title: "Added to cart", description: `${cleanName} × ${qty}` });
  };

  // Spec rows for the "About This Wine" grid
  const specs = [
    { label: "Region",        value: product.region,   icon: MapPin },
    { label: "Country",       value: product.country,  icon: Globe },
    { label: "Grape Variety", value: grapeDisplay,     icon: Grape },
    { label: "Colour",        value: product.type,     icon: Wine },
    { label: "Vintage",       value: product.vintage,  icon: Calendar },
    { label: "Bottle Size",   value: product.size,     icon: Package },
    ...(product.style        ? [{ label: "Style",        value: product.style,        icon: Star }]        : []),
    ...(product.alcohol      ? [{ label: "Alcohol",      value: product.alcohol,      icon: GlassWater }]  : []),
    ...(product.serve_temp   ? [{ label: "Serving Temp", value: product.serve_temp,   icon: Thermometer }] : []),
    ...(product.cellaring    ? [{ label: "Aging",        value: product.cellaring,    icon: Clock }]       : []),
    ...(product.food_pairing ? [{ label: "Food Pairing", value: product.food_pairing, icon: ChevronRight }]: []),
  ].filter(r => r.value);

  return (
    <div className="bg-white dark:bg-background min-h-screen">

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-[hsl(30,20%,98%)] dark:bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-muted-foreground font-body">
          <Link href="/"><a className="hover:text-foreground transition-colors">Home</a></Link>
          <span>/</span>
          <Link href="/wines"><a className="hover:text-foreground transition-colors">Wines</a></Link>
          <span>/</span>
          <Link href={`/wines?country=${product.country}`}><a className="hover:text-foreground transition-colors">{product.country}</a></Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{cleanName}</span>
        </div>
      </div>

      {/* ── Hero: bottle + purchase panel ────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr_320px] gap-8 items-start">

          {/* Bottle image */}
          <div className="flex items-center justify-center bg-[hsl(30,15%,97%)] dark:bg-muted/30 rounded-2xl py-10 px-6 min-h-[400px]">
            {product.image_url ? (
              <img
                src={product.image_url?.startsWith('/') ? `${API_BASE}${product.image_url}` : product.image_url}
                alt={cleanName}
                className="max-h-[420px] w-auto object-contain drop-shadow-xl"
              />
            ) : (
              <BottleSVG color={bottleColor} />
            )}
          </div>

          {/* Wine info */}
          <div className="pt-2">
            {/* Brand */}
            <Link href={`/wines?brand=${encodeURIComponent(product.brand)}`}>
              <a className="text-[hsl(355,62%,28%)] font-body text-sm font-semibold hover:underline tracking-wide">
                {product.brand}
              </a>
            </Link>

            {/* Name */}
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground leading-tight mt-1 mb-1">
              {cleanName}
            </h1>

            {/* Phonetic for French */}
            {product.phonetic && (
              <p className="text-sm text-muted-foreground italic mb-3">{product.phonetic}</p>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border font-body ${pillClass}`}>
                {product.type}
              </span>
              {product.vintage && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-border bg-muted text-muted-foreground font-body">
                  {product.vintage}
                </span>
              )}
              {product.size && product.size !== "750ml" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-border bg-muted text-muted-foreground font-body">
                  {product.size}
                </span>
              )}

            </div>

            {/* Quick meta */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground font-body mb-5">
              {product.country && (
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 shrink-0" />{product.country}
                </span>
              )}
              {product.region && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />{product.region}
                </span>
              )}
              {grapeDisplay && (
                <span className="flex items-center gap-1.5">
                  <Grape className="w-3.5 h-3.5 shrink-0" />{grapeDisplay}
                </span>
              )}
            </div>

            {/* Critic scores (compact row) */}
            {product.ratings && product.ratings.length > 0 && (
              <div className="mb-6">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-body font-medium mb-3">
                  Critic Scores
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.ratings.map((r, i) => <ScoreBadge key={i} {...r} />)}
                </div>
              </div>
            )}

            {/* Tasting note preview */}
            {tastingNoteDisplay && (
              <div className="bg-[hsl(30,20%,97%)] dark:bg-muted/30 rounded-xl p-4 border border-[hsl(30,15%,90%)] dark:border-border mb-5">
                <p className="font-body text-sm text-foreground/80 leading-relaxed italic line-clamp-3">
                  "{tastingNoteDisplay}"
                </p>
              </div>
            )}

            {/* Ask AI Sommelier */}
            <Link href="/sommelier">
              <a className="inline-flex items-center gap-2 text-xs text-[hsl(355,62%,28%)] hover:underline font-body font-medium">
                <Bot className="w-3.5 h-3.5" /> Ask our AI Sommelier about this wine
              </a>
            </Link>
          </div>

          {/* Purchase panel — sticky */}
          <div className="md:sticky md:top-24 space-y-4">
            <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
              {/* Price header */}
              <div className="bg-[hsl(30,20%,98%)] dark:bg-muted/30 px-6 py-5 border-b border-border">
                {product.promo_price ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-body font-bold bg-red-500 text-white px-2 py-0.5 rounded">SPECIAL PRICE</span>
                    </div>
                    <p className="font-display text-4xl font-bold text-red-500 leading-none">
                      {formatPrice(product.promo_price)}
                    </p>
                    <p className="font-body text-sm text-muted-foreground line-through mt-1">
                      Original: {formatPrice(product.price)}
                    </p>
                    <p className="text-xs text-muted-foreground font-body mt-0.5">Per bottle · incl. tax</p>
                  </>
                ) : product.price > 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground font-body mb-1">List Price</p>
                    <p className="font-display text-4xl font-bold text-foreground">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-xs text-muted-foreground font-body mt-1">Per bottle · incl. tax</p>
                  </>
                ) : (
                  <p className="font-display text-xl font-semibold text-muted-foreground">Price on Application</p>
                )}
              </div>

              {/* Controls */}
              {product.price > 0 && product.status !== "Sold Out" && (
                <div className="px-6 py-5 space-y-3">
                  {/* Qty */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-body text-muted-foreground">Quantity</span>
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-body text-lg leading-none"
                        data-testid="qty-minus"
                      >−</button>
                      <span className="px-4 py-2 text-sm font-medium font-body border-x border-border min-w-[44px] text-center" data-testid="qty-value">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(q => q + 1)}
                        className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-body text-lg leading-none"
                        data-testid="qty-plus"
                      >+</button>
                    </div>
                  </div>

                  {/* Add to cart */}
                  <Button
                    onClick={handleAdd}
                    className="w-full bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white font-body font-semibold h-12 text-sm rounded-xl"
                    data-testid="add-to-cart-btn"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart — {formatPrice((product.promo_price ?? product.price) * qty)}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground font-body">
                    Free delivery on orders over HK$1,000
                  </p>
                </div>
              )}

              {product.status === "Sold Out" && (
                <div className="px-6 py-5">
                  <div className="w-full h-12 rounded-xl border-2 border-border bg-muted flex items-center justify-center text-sm text-muted-foreground font-body font-medium">
                    Currently Unavailable
                  </div>
                </div>
              )}

              {/* Trust signals */}
              <div className="border-t border-border px-6 py-4 space-y-2.5">
                {[
                  { icon: "✓", text: "Guaranteed authentic provenance" },
                  { icon: "🚚", text: "Free HK delivery over HK$1,000" },
                  { icon: "❄️", text: "Temperature-controlled storage" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-muted-foreground font-body">
                    <span className="text-sm">{t.icon}</span>
                    {t.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Brand card */}
            {brandInfo && (
              <div className="border border-border rounded-2xl p-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-body font-medium mb-2">About the Producer</p>
                <p className="font-display text-base font-semibold text-foreground mb-2">{product.brand}</p>
                <p className="font-body text-xs text-muted-foreground leading-relaxed line-clamp-4 mb-3">{brandInfo.description}</p>
                <div className="flex gap-3">
                  <Link href={`/wines?brand=${encodeURIComponent(product.brand)}`}>
                    <a className="text-xs text-[hsl(355,62%,28%)] font-body font-medium hover:underline flex items-center gap-1">
                      All {product.brand} wines <ChevronRight className="w-3 h-3" />
                    </a>
                  </Link>
                  {brandInfo.website && (
                    <a href={brandInfo.website} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-muted-foreground font-body hover:text-foreground flex items-center gap-1">
                      Website <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── About This Wine ───────────────────────────────────────────────── */}
      <div className="border-t border-border bg-[hsl(30,20%,98%)] dark:bg-muted/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-8">About This Wine</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Specs grid */}
            <div>
              <div className="grid grid-cols-2 gap-px bg-border rounded-xl overflow-hidden border border-border">
                {specs.map((spec, i) => (
                  <div
                    key={i}
                    className={`bg-white dark:bg-background px-5 py-4 ${
                      specs.length % 2 !== 0 && i === specs.length - 1 ? "col-span-2" : ""
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-body font-medium mb-1">
                      {spec.label}
                    </p>
                    <p className="font-body text-sm font-semibold text-foreground leading-snug">
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasting notes + full description */}
            <div className="space-y-6">
              {tastingNoteDisplay && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 rounded-full bg-[hsl(355,62%,28%)]" />
                    <h3 className="font-display text-lg font-semibold text-foreground">Tasting Notes</h3>
                  </div>
                  <p className="font-body text-sm text-foreground/80 leading-relaxed">{tastingNoteDisplay}</p>
                </div>
              )}

              {product.winemaker_notes && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 rounded-full bg-[hsl(355,62%,28%)]" />
                    <h3 className="font-display text-lg font-semibold text-foreground">Winemaker's Notes</h3>
                  </div>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{product.winemaker_notes}</p>
                </div>
              )}

              {product.description && !tastingNoteDisplay && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 rounded-full bg-[hsl(355,62%,28%)]" />
                    <h3 className="font-display text-lg font-semibold text-foreground">About this Wine</h3>
                  </div>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Critic Scores (full section) ──────────────────────────────────── */}
      {product.ratings && product.ratings.length > 0 && (
        <div className="border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-8">Critic Scores</h2>
            <div className="flex flex-wrap gap-8 items-start">
              {product.ratings.map((r, i) => {
                const pct = r.score / r.maxScore;
                const radius = 36;
                const circ = 2 * Math.PI * radius;
                const dash = pct * circ;
                return (
                  <div key={i} className="flex flex-col items-center gap-2 group">
                    <div className="relative w-24 h-24">
                      <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
                        <circle cx="44" cy="44" r={radius} fill="none" stroke="hsl(30,15%,90%)" strokeWidth="6" />
                        <circle
                          cx="44" cy="44" r={radius} fill="none"
                          stroke="hsl(355,62%,28%)" strokeWidth="6"
                          strokeDasharray={`${dash} ${circ}`}
                          strokeLinecap="round"
                          className="transition-all duration-700"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-display text-2xl font-bold text-foreground leading-none">{r.score}</span>
                        <span className="font-body text-[10px] text-muted-foreground">/{r.maxScore}</span>
                      </div>
                    </div>
                    <p className="font-body text-sm font-semibold text-foreground text-center leading-tight">{r.source}</p>
                    {r.year && <p className="font-body text-[11px] text-muted-foreground">{r.year}</p>}
                    {r.note && (
                      <p className="text-xs text-muted-foreground font-body italic max-w-[140px] text-center leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity">
                        "{r.note}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Social / Media links ──────────────────────────────────────────── */}
      {product.media_links && product.media_links.length > 0 && (
        <div className="border-t border-border bg-[hsl(30,20%,98%)] dark:bg-muted/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Featured In</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              {product.media_links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white dark:bg-card border border-border rounded-xl hover:border-[hsl(355,62%,28%)] hover:shadow-sm transition-all group"
                  data-testid={`media-link-${i}`}
                >
                  <MediaIcon type={link.type} />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-foreground group-hover:text-[hsl(355,62%,28%)] transition-colors line-clamp-1">
                      {link.label}
                    </p>
                    <p className="font-body text-xs text-muted-foreground capitalize">{link.type}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Ask AI Sommelier CTA ──────────────────────────────────────────── */}
      <div className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="bg-[hsl(355,62%,28%)]/5 border border-[hsl(355,62%,28%)]/20 rounded-2xl p-6 flex items-start gap-5">
            <div className="w-11 h-11 rounded-full bg-[hsl(355,62%,28%)]/15 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-[hsl(355,62%,28%)]" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold mb-1">Not sure if this is right for you?</h3>
              <p className="font-body text-sm text-muted-foreground mb-4">
                Ask our AI Sommelier in Cantonese or English — pairing suggestions, taste profile, occasion suitability.
              </p>
              <Link href="/sommelier">
                <Button variant="outline" className="font-body border-[hsl(355,62%,28%)] text-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,28%)] hover:text-white rounded-lg">
                  <Bot className="w-4 h-4 mr-2" />
                  Chat with AI Sommelier
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Related wines ─────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <div className="border-t border-border bg-[hsl(30,20%,98%)] dark:bg-muted/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold">More from {product.brand}</h2>
              <Link href={`/wines?brand=${encodeURIComponent(product.brand)}`}>
                <a className="font-body text-sm text-[hsl(355,62%,28%)] hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </a>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(p => <WineCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
