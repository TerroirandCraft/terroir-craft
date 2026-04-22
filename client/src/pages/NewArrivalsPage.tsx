import { useQuery } from "@tanstack/react-query";
import { apiRequest, API_BASE } from "@/lib/queryClient";
import WineCard from "@/components/WineCard";
import type { Product } from "@/lib/products";

export default function NewArrivalsPage() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/products");
      return res.json() as Promise<Product[]>;
    },
    staleTime: 30000,
  });

  const newArrivals = products.filter((p: any) => p.new_arrival === true);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[hsl(355,62%,28%)] text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-white/60 mb-3">最新到貨</p>
          <h1 className="font-display text-4xl md:text-5xl font-light mb-2">New Arrivals</h1>
          {!isLoading && newArrivals.length > 0 && (
            <p className="font-body text-sm text-white/60 mt-2">{newArrivals.length} wines</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : newArrivals.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-2xl font-light text-foreground mb-3">我們正在為您精心挑選</p>
            <p className="font-body text-sm text-muted-foreground">敬請期待 · Stay tuned</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {newArrivals.map((product: Product) => (
              <WineCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
