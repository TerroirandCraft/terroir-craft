import { Link } from "wouter";
import { ShoppingCart, Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/products";
import { getTypeBadgeClass, formatPrice } from "@/lib/products";
import { useCart } from "./CartContext";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/lib/queryClient";

interface WineCardProps {
  product: Product;
}

const TYPE_COLOR_MAP: Record<string, string> = {
  "Red": "bg-red-900/30 text-red-200",
  "White": "bg-amber-800/30 text-amber-200",
  "Sparkling": "bg-sky-800/30 text-sky-200",
  "Sparkling Red": "bg-purple-800/30 text-purple-200",
  "Champagne": "bg-yellow-800/30 text-yellow-100",
  "Rose": "bg-pink-800/30 text-pink-200",
  "Fortified": "bg-orange-800/30 text-orange-200",
  "Magoli": "bg-green-800/30 text-green-200",
  "Supplement": "bg-fuchsia-800/30 text-fuchsia-200",
};

const BOTTLE_COLORS: Record<string, string> = {
  "Red": "#7B1F2E",
  "White": "#C4A84F",
  "Sparkling": "#8DB5CC",
  "Sparkling Red": "#9B2A6B",
  "Champagne": "#D4AF37",
  "Rose": "#D4789A",
  "Fortified": "#8B4513",
  "Magoli": "#5B8A3C",
  "Supplement": "#8B2B8C",
};

export default function WineCard({ product }: WineCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const bottleColor = BOTTLE_COLORS[product.type] || "#7B1F2E";
  const typeClass = TYPE_COLOR_MAP[product.type] || "bg-gray-800/30 text-gray-200";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast({
      title: "Added to cart",
      description: `${product.name} × 1`,
    });
  };

  return (
    <Link href={`/wines/${product.id}`}>
      <a
        className="bg-card border border-border rounded-lg overflow-hidden card-hover flex flex-col group"
        data-testid={`wine-card-${product.id}`}
      >
        {/* Wine illustration area */}
        <div
          className="relative h-44 flex items-end justify-center overflow-hidden"
          style={{ background: `linear-gradient(160deg, hsl(20,10%,14%) 0%, ${bottleColor}22 100%)` }}
        >
          {/* Show real bottle shot if available, else SVG placeholder */}
          {product.image_url ? (
            <img
              src={product.image_url.startsWith('/') ? `${API_BASE}${product.image_url}` : product.image_url}
              alt={product.name}
              className="h-36 w-auto object-contain mb-2 group-hover:scale-105 transition-transform duration-300"
            />
          ) : product.type === "Supplement" ? (
            <div className="h-36 flex items-center justify-center mb-2">
              <svg viewBox="0 0 60 60" className="w-20 h-20 opacity-70" fill="none">
                <ellipse cx="30" cy="30" rx="22" ry="12" fill="#8B2B8C" opacity="0.8" transform="rotate(-30 30 30)" />
                <ellipse cx="30" cy="30" rx="22" ry="12" fill="#20B2AA" opacity="0.4" transform="rotate(-30 30 30)" />
                <line x1="13" y1="44" x2="47" y2="16" stroke="white" strokeWidth="1" opacity="0.4" />
              </svg>
            </div>
          ) : null}
          {!product.image_url && product.type !== "Supplement" && <svg
            viewBox="0 0 60 120"
            className="h-36 w-auto mb-2 opacity-90 group-hover:scale-105 transition-transform duration-300"
            fill="none"
            aria-hidden="true"
          >
            {/* Bottle body */}
            <path
              d="M22 45 C18 50 16 60 16 75 L16 100 C16 105 20 108 30 108 C40 108 44 105 44 100 L44 75 C44 60 42 50 38 45 L38 28 L22 28 Z"
              fill={bottleColor}
              opacity="0.9"
            />
            {/* Neck */}
            <rect x="25" y="18" width="10" height="12" rx="2" fill={bottleColor} opacity="0.9" />
            {/* Cork / capsule */}
            <rect x="24" y="12" width="12" height="8" rx="2" fill={bottleColor} opacity="0.7" />
            {/* Label */}
            <rect x="19" y="68" width="22" height="20" rx="2" fill="white" opacity="0.15" />
            {/* Shine */}
            <line x1="22" y1="50" x2="22" y2="100" stroke="white" strokeWidth="1.5" opacity="0.1" />
          </svg>}

          {/* Type badge */}
          <span className={`absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-full font-body font-medium ${typeClass}`}>
            {product.type}
          </span>

          {/* Status badge */}
          {product.status === "Fine Wine" && (
            <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-[hsl(38,65%,52%)]/20 text-[hsl(38,65%,70%)] font-body font-medium">
              Fine Wine
            </span>
          )}
          {product.status === "Sold Out" && (
            <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-black/60 text-white/80 font-body font-medium">
              Sold Out
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <p className="font-body text-[11px] text-muted-foreground mb-1 truncate">{product.brand}</p>
          <h3 className="font-display text-sm font-medium text-foreground leading-snug mb-1 line-clamp-2 group-hover:text-[hsl(355,62%,28%)] transition-colors">
            {product.name.replace(product.brand + " - ", "")}
          </h3>
          <p className="font-body text-[11px] text-muted-foreground mb-1">
            {product.country}{product.region ? ` · ${product.region}` : ""}
            {product.vintage ? ` · ${product.vintage}` : ""}
          </p>
          {(product.grape || (product.grape_varietals && product.grape_varietals.length > 0)) && (
            <p className="font-body text-[10px] text-muted-foreground/70 mb-3 truncate">
              {product.grape || product.grape_varietals!.join(", ")}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              {product.status === "Sold Out" ? (
                <span className="text-muted-foreground text-sm font-body">Sold Out</span>
              ) : product.promo_price ? (
                <>
                  {/* Promo price — bold red, eye-catching */}
                  <span className="font-display text-base font-bold text-red-500 leading-none">
                    {formatPrice(product.promo_price)}
                    <span className="ml-1.5 text-[10px] font-body font-semibold bg-red-500 text-white px-1.5 py-0.5 rounded align-middle">
                      SALE
                    </span>
                  </span>
                  {/* Original price — strikethrough */}
                  <span className="font-body text-[11px] text-muted-foreground line-through leading-none">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="font-display text-base font-semibold text-[hsl(355,62%,28%)]">
                  {product.price > 0 ? formatPrice(product.price) : "POA"}
                </span>
              )}
            </div>
            {product.status !== "Sold Out" && (
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="bg-[hsl(355,62%,28%)] hover:bg-[hsl(355,62%,22%)] text-white h-8 px-3 text-xs font-body"
                data-testid={`add-to-cart-${product.id}`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </a>
    </Link>
  );
}
