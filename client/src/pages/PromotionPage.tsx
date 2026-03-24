import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Star, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/components/CartContext";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/lib/queryClient";

// ── Promotion definitions ─────────────────────────────────────────────────────
export const PROMOTIONS: Record<string, {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  endDate?: string;
  heroGradient: string;
  accentColor: string;
}> = {
  bordeaux2022: {
    id: "bordeaux2022",
    title: "BORDEAUX 2022",
    subtitle: "Grand Cru Classé En Primeur Selection",
    description: "The 2022 vintage is widely celebrated as one of Bordeaux's finest in decades — a year of perfect ripeness, concentrated fruit and exceptional structure. We have secured an exclusive allocation of 18 Grand Cru Classé wines at special promotional prices for our valued members.",
    tag: "Limited Allocation",
    endDate: "2026-04-30",
    heroGradient: "linear-gradient(135deg, hsl(355,70%,12%) 0%, hsl(30,40%,15%) 40%, hsl(355,60%,18%) 100%)",
    accentColor: "hsl(40, 80%, 55%)",
  },
};

// ── Score Badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ source, score }: { source: string; score: number }) {
  const colors: Record<string, string> = {
    WA: "bg-red-900/80 text-red-100 border-red-700/50",
    JS: "bg-amber-900/80 text-amber-100 border-amber-700/50",
    JR: "bg-emerald-900/80 text-emerald-100 border-emerald-700/50",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-body font-bold border ${colors[source] || "bg-gray-800 text-gray-200 border-gray-600"}`}>
      {source} {score}
    </span>
  );
}

// ── Wine Card for Promotion ───────────────────────────────────────────────────
function PromoWineCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const savings = product.price - (product.promo_price ?? product.price);
  const savingsPct = Math.round((savings / product.price) * 100);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
    toast({ title: "Added to cart", description: `${product.name.split(" - ")[1] || product.name} × 1` });
  };

  return (
    <Link href={`/wines/${product.id}`}>
      <a className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col">
        {/* Image */}
        <div className="relative h-52 flex items-center justify-center bg-black/20 overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url.startsWith('/') ? `${API_BASE}${product.image_url}` : product.image_url}
              alt={product.name}
              className="h-48 w-28 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
            />
          ) : (
            <div className="w-16 h-40 bg-white/10 rounded" />
          )}
          {/* SALE badge */}
          {product.promo_price && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-body font-bold px-2 py-1 rounded-full">
              -{savingsPct}%
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          {/* Region */}
          <p className="font-body text-[10px] text-white/40 uppercase tracking-widest mb-1">{product.region} · {product.vintage}</p>

          {/* Name */}
          <h3 className="font-display text-sm font-medium text-white leading-snug mb-2 line-clamp-2 group-hover:text-amber-300 transition-colors">
            {product.name.replace("Bordeaux 2022 - ", "").replace(product.brand + " - ", "")}
          </h3>

          {/* Grape */}
          {product.grape && (
            <p className="font-body text-[10px] text-white/40 mb-2 line-clamp-1">{product.grape}</p>
          )}

          {/* Scores */}
          {product.ratings && product.ratings.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {(product.ratings as any[]).map((r: any) => (
                <ScoreBadge key={r.source} source={r.source} score={r.score} />
              ))}
            </div>
          )}

          {/* Price */}
          <div className="mt-auto flex items-end justify-between gap-2">
            <div>
              {product.promo_price ? (
                <>
                  <p className="font-display text-lg font-bold text-red-400 leading-none">
                    {formatPrice(product.promo_price)}
                  </p>
                  <p className="font-body text-xs text-white/35 line-through leading-none mt-0.5">
                    {formatPrice(product.price)}
                  </p>
                </>
              ) : (
                <p className="font-display text-lg font-bold text-white">{formatPrice(product.price)}</p>
              )}
            </div>
            <Button
              size="sm"
              onClick={handleAdd}
              className="bg-amber-600 hover:bg-amber-500 text-white h-8 px-3 text-xs font-body shrink-0"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </a>
    </Link>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PromotionPage() {
  const params = useParams<{ id: string }>();
  const promoId = params.id || "bordeaux2022";
  const promo = PROMOTIONS[promoId];

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const promoWines = allProducts.filter((p: any) => p.promotion === promoId);

  // Group by region
  const byRegion: Record<string, Product[]> = {};
  promoWines.forEach(w => {
    const key = w.region || "Other";
    if (!byRegion[key]) byRegion[key] = [];
    byRegion[key].push(w);
  });

  // Region order for Bordeaux
  const regionOrder = ["Saint-Estèphe", "Pessac-Léognan", "Saint-Julien", "Margaux", "Pomerol", "Pauillac", "Bordeaux"];
  const sortedRegions = Object.keys(byRegion).sort((a, b) => {
    const ia = regionOrder.indexOf(a), ib = regionOrder.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  if (!promo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-display text-2xl text-muted-foreground">Promotion not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero Banner ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: promo.heroGradient, minHeight: "420px" }}
      >
        {/* Decorative vine/pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M30 0 C30 0 45 15 45 30 C45 45 30 60 30 60 C30 60 15 45 15 30 C15 15 30 0 30 0Z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }} />

        {/* Floating bottle images */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 overflow-hidden opacity-20 pointer-events-none hidden lg:block">
          <div className="flex gap-4 h-full items-end pb-8 pr-8">
            {promoWines.slice(0, 5).map((w, i) => (
              w.image_url && (
                <img
                  key={w.id}
                  src={w.image_url.startsWith('/') ? `${API_BASE}${w.image_url}` : w.image_url}
                  alt=""
                  className="h-64 w-auto object-contain drop-shadow-2xl"
                  style={{ transform: `rotate(${(i - 2) * 3}deg) translateY(${i % 2 === 0 ? '0' : '20px'})` }}
                />
              )
            ))}
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 mb-6">
            <Tag className="w-3.5 h-3.5" style={{ color: promo.accentColor }} />
            <span className="font-body text-xs tracking-[0.3em] uppercase font-semibold" style={{ color: promo.accentColor }}>
              {promo.tag}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-white mb-4 leading-none tracking-tight">
            {promo.title}
          </h1>
          <p className="font-body text-white/60 text-sm md:text-base tracking-widest uppercase mb-6">
            {promo.subtitle}
          </p>
          <p className="font-body text-white/70 text-sm md:text-base max-w-xl leading-relaxed mb-8">
            {promo.description}
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="font-display text-3xl font-light text-white">{promoWines.length}</p>
              <p className="font-body text-xs text-white/50 uppercase tracking-widest">Selected Wines</p>
            </div>
            <div className="border-l border-white/20 pl-6">
              <p className="font-display text-3xl font-light" style={{ color: promo.accentColor }}>2022</p>
              <p className="font-body text-xs text-white/50 uppercase tracking-widest">Exceptional Vintage</p>
            </div>
            {promo.endDate && (
              <div className="border-l border-white/20 pl-6">
                <p className="font-display text-3xl font-light text-white">
                  {new Date(promo.endDate).toLocaleDateString('en-HK', { day: 'numeric', month: 'short' })}
                </p>
                <p className="font-body text-xs text-white/50 uppercase tracking-widest">Offer Ends</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Wine Grid by Region ── */}
      <div className="bg-[hsl(355,40%,10%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">

          {sortedRegions.map(region => (
            <div key={region} className="mb-14">
              {/* Region header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-white/10" />
                <h2 className="font-display text-lg font-light text-white/80 tracking-widest uppercase">
                  {region}
                </h2>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {byRegion[region].map(w => (
                  <PromoWineCard key={w.id} product={w} />
                ))}
              </div>
            </div>
          ))}

          {promoWines.length === 0 && (
            <div className="text-center py-24">
              <p className="font-body text-white/40">No wines available for this promotion.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer CTA ── */}
      <div className="bg-[hsl(355,40%,8%)] border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-body text-white/40 text-sm mb-4">
            All prices are per bottle · Subject to availability · Free delivery on orders over HK$1,000
          </p>
          <Link href="/cart">
            <Button className="bg-amber-600 hover:bg-amber-500 text-white font-body font-semibold h-11 px-8">
              View Cart & Checkout <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
