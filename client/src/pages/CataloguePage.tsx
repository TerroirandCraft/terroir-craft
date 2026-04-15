import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WineCard from "@/components/WineCard";
import type { Product } from "@/lib/products";

const TYPES = ["All Types", "Red", "White", "Sparkling", "Champagne", "Rose", "Fortified", "Sparkling Red", "Makgeolli", "Supplement"];
const COUNTRIES = ["All Countries", "France", "Australia", "Portugal", "USA", "Germany", "New Zealand", "Spain", "Italy", "South Africa", "Korea"];
const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "vintage-desc", label: "Newest Vintage" },
];

export default function CataloguePage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [countryFilter, setCountryFilter] = useState("All Countries");
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(10000);
  const [sort, setSort] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [occasionFilter, setOccasionFilter] = useState<string | null>(null);

  // Read ?country= and ?brand= and ?occasion= from URL
  const [location] = useLocation();

  const applyHashParams = () => {
    const params = new URLSearchParams(window.location.search);
    const countryParam = params.get("country");
    const brandParam = params.get("brand");
    const occasionParam = params.get("occasion");

    if (occasionParam) {
      setOccasionFilter(occasionParam);
      setCountryFilter("All Countries");
      setBrandFilter(null);
      return;
    }
    setOccasionFilter(null);
    if (countryParam && COUNTRIES.includes(countryParam)) {
      setCountryFilter(countryParam);
      setBrandFilter(null);
      setShowFilters(true);
    } else if (!countryParam && !brandParam) {
      setCountryFilter("All Countries");
    }
    if (brandParam) {
      setBrandFilter(brandParam);
      setCountryFilter("All Countries");
    }
  };

  useEffect(() => {
    applyHashParams();
    window.addEventListener("hashchange", applyHashParams);
    return () => window.removeEventListener("hashchange", applyHashParams);
  }, [location]);

  // Fetch occasion products if needed
  const { data: occasionProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/occasions", occasionFilter],
    queryFn: async () => {
      const { apiRequest } = await import("@/lib/queryClient");
      const res = await apiRequest("GET", `/api/occasions/${occasionFilter}`);
      return res.json();
    },
    enabled: !!occasionFilter,
  });

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Use occasion products if occasion filter is active
  const baseProducts = occasionFilter ? occasionProducts : products;

  const OCCASION_LABELS: Record<string, string> = {
    gifts: "Gifts 送禮之選",
    under300: "Under HK$300",
    easyreds: "Easy-Drinking Reds",
    champagne: "Champagne & Sparkling",
    staffpicks: "Staff Picks 員工精選",
    hotpot: "HK Hotpot 打邊爐",
    bbq: "BBQ & Grill",
  };

  const filtered = useMemo(() => {
    let results = [...baseProducts];
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q)
      );
    }
    // Skip other filters when occasion is active
    if (!occasionFilter) {
      if (brandFilter) {
        results = results.filter(p => p.brand.toLowerCase() === brandFilter.toLowerCase());
      } else {
        if (typeFilter !== "All Types") results = results.filter(p => p.type === typeFilter);
        if (countryFilter !== "All Countries") results = results.filter(p => p.country === countryFilter);
      }
      results = results.filter(p => p.price === 0 || (p.price >= priceMin && p.price <= priceMax));
    }

    switch (sort) {
      case "price-asc": results.sort((a, b) => a.price - b.price); break;
      case "price-desc": results.sort((a, b) => b.price - a.price); break;
      case "name-asc": results.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "vintage-desc": results.sort((a, b) => {
        const av = isNaN(Number(a.vintage)) ? 0 : Number(a.vintage);
        const bv = isNaN(Number(b.vintage)) ? 0 : Number(b.vintage);
        return bv - av;
      }); break;
    }
    return results;
  }, [baseProducts, occasionFilter, search, typeFilter, countryFilter, brandFilter, priceMin, priceMax, sort]);

  const activeFilters = [
    brandFilter ? `Brand: ${brandFilter}` : null,
    typeFilter !== "All Types" ? typeFilter : null,
    countryFilter !== "All Countries" ? countryFilter : null,
    (priceMin > 0 || priceMax < 10000) ? `HK$${priceMin.toLocaleString()} – ${priceMax >= 10000 ? 'No limit' : 'HK$' + priceMax.toLocaleString()}` : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[hsl(355,62%,28%)] text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {occasionFilter ? (
            <>
              {/* Back button — prominent so customers can easily return */}
              <button
                onClick={() => { setOccasionFilter(null); window.history.pushState({}, "", window.location.pathname); }}
                className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 transition-colors font-body text-sm text-white font-medium"
              >
                <span className="text-base leading-none">←</span>
                瀏覽全部酒款 View All Wines
              </button>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-body text-[11px] tracking-[0.2em] uppercase text-white/50">Shop by Occasion</span>
              </div>
              <h1 className="font-script text-5xl md:text-6xl mb-2" style={{fontStyle:'normal'}}>{OCCASION_LABELS[occasionFilter]}</h1>
              <p className="font-body text-white/70 text-sm">{filtered.length} wines curated for this occasion</p>
            </>
          ) : (
            <>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-white/60 mb-3">Our Collection</p>
              <h1 className="font-display text-4xl md:text-5xl font-light mb-2">Wine Catalogue 酒款目錄</h1>
              <p className="font-body text-white/70 text-sm">{products.length} wines across 23 exclusive brands</p>
            </>
          )}
        </div>
      </div>

      {/* Horizontal region quick-filter bar */}
      <div className="border-b border-border bg-white sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
            {/* Country tabs */}
            {["All Countries", "France", "Australia", "Portugal", "USA", "Germany", "New Zealand", "Korea", "Spain", "South Africa", "Italy"].map(c => {
              const flagMap: Record<string, string> = { "France": "🇫🇷", "Australia": "🇦🇺", "Portugal": "🇵🇹", "USA": "🇺🇸", "Germany": "🇩🇪", "New Zealand": "🇳🇿", "Korea": "🇰🇷", "Spain": "🇪🇸", "South Africa": "🇿🇦", "Italy": "🇮🇹" };
              const isActive = !brandFilter && countryFilter === c;
              return (
                <button
                  key={c}
                  onClick={() => { setBrandFilter(null); setCountryFilter(c); }}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-body font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[hsl(355,62%,28%)] text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  data-testid={`region-tab-${c.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {flagMap[c] && <span>{flagMap[c]}</span>}
                  {c === "All Countries" ? "🌍 All Regions" : c}
                </button>
              );
            })}
            {/* Separator */}
            <span className="shrink-0 w-px h-5 bg-border mx-1" />
            {/* Hydrodol brand tab */}
            <button
              onClick={() => setBrandFilter(brandFilter === "Hydrodol" ? null : "Hydrodol")}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-body font-medium transition-all whitespace-nowrap ${
                brandFilter === "Hydrodol"
                  ? "bg-[hsl(285,65%,35%)] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid="region-tab-hydrodol"
            >
              <span>💊</span>
              Hydrodol
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search + controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search wines, brands, regions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 font-body"
              data-testid="catalogue-search"
            />
            {search && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px] font-body text-sm" data-testid="sort-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value} className="font-body text-sm">{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="font-body text-sm gap-2"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="toggle-filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilters.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[hsl(355,62%,28%)] text-white text-[10px] flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </Button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-lg p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Wine Type</label>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1 rounded-full text-xs font-body font-medium border transition-colors ${
                      typeFilter === t
                        ? "bg-[hsl(355,62%,28%)] text-white border-transparent"
                        : "border-border text-muted-foreground hover:border-[hsl(355,62%,28%)]"
                    }`}
                    data-testid={`filter-type-${t}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Country</label>
              <div className="flex flex-wrap gap-1.5">
                {COUNTRIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCountryFilter(c)}
                    className={`px-3 py-1 rounded-full text-xs font-body font-medium border transition-colors ${
                      countryFilter === c
                        ? "bg-[hsl(355,62%,28%)] text-white border-transparent"
                        : "border-border text-muted-foreground hover:border-[hsl(355,62%,28%)]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {/* Min price slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wide">Min Price</label>
                  <span className="font-body text-xs font-semibold text-foreground">HK${priceMin.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0} max={9900} step={100}
                  value={priceMin}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setPriceMin(v);
                    if (v >= priceMax) setPriceMax(Math.min(10000, v + 100));
                  }}
                  className="w-full accent-[hsl(355,62%,28%)] cursor-pointer"
                  data-testid="price-min"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground/60 font-body">
                  <span>HK$0</span><span>HK$9,900</span>
                </div>
              </div>
              {/* Max price slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wide">Max Price</label>
                  <span className="font-body text-xs font-semibold text-foreground">{priceMax >= 10000 ? 'No limit' : 'HK$' + priceMax.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={100} max={10000} step={100}
                  value={priceMax}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setPriceMax(v);
                    if (v <= priceMin) setPriceMin(Math.max(0, v - 100));
                  }}
                  className="w-full accent-[hsl(355,62%,28%)] cursor-pointer"
                  data-testid="price-max"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground/60 font-body">
                  <span>HK$100</span><span>No limit</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {activeFilters.map(f => (
              <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[hsl(355,62%,28%)]/10 text-[hsl(355,62%,28%)] rounded-full text-xs font-body font-medium">
                {f}
                <button onClick={() => {
                  if (f?.startsWith("Brand:")) setBrandFilter(null);
                  if (f === typeFilter) setTypeFilter("All Types");
                  if (f === countryFilter) setCountryFilter("All Countries");
                  if (f?.startsWith("HK$")) { setPriceMax(10000); setPriceMin(0); }
                }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={() => { setBrandFilter(null); setTypeFilter("All Types"); setCountryFilter("All Countries"); setPriceMax(10000); setPriceMin(0); }}
              className="text-xs text-muted-foreground hover:text-foreground font-body underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results count */}
        <p className="font-body text-sm text-muted-foreground mb-6">
          {isLoading ? "Loading..." : `${filtered.length} wine${filtered.length !== 1 ? "s" : ""} found`}
        </p>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden">
                <div className="skeleton h-44 w-full" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-3 w-2/3" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 max-w-lg mx-auto">
            <div className="text-4xl mb-4">🔍</div>
            <p className="font-display text-2xl text-foreground mb-2">搵唔到？ Can't find it?</p>
            <p className="font-body text-sm text-muted-foreground mb-6">
              We may be able to source it for you. WhatsApp us with your request and we'll do our best.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => { setSearch(""); setTypeFilter("All Types"); setCountryFilter("All Countries"); setPriceMax(10000); setPriceMin(0); }}>
                Clear filters
              </Button>
              <a
                href={`https://wa.me/85298055609?text=${encodeURIComponent(`Hi Terroir & Craft, I'm looking for: ${search || 'a wine'} — can you help?`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full sm:w-auto font-body" style={{ background: "#25D366", border: "none", color: "white" }}>
                  <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp 查詢
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(product => (
              <WineCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
