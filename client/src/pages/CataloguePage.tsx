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
  const [priceMax, setPriceMax] = useState<number>(10000);
  const [sort, setSort] = useState("default");
  const [showFilters, setShowFilters] = useState(false);

  // Read ?country= and ?brand= from URL hash query string, re-run whenever the hash changes
  const [location] = useLocation();
  useEffect(() => {
    const hashSearch = window.location.hash.split("?")[1] || "";
    const params = new URLSearchParams(hashSearch);
    const countryParam = params.get("country");
    const brandParam = params.get("brand");
    if (countryParam && COUNTRIES.includes(countryParam)) {
      setCountryFilter(countryParam);
      setBrandFilter(null);
      setShowFilters(true);
    } else if (!countryParam) {
      // Only reset if navigating without a country param (e.g. plain /wines)
      // Don't reset if user manually changed the filter
    }
    if (brandParam) {
      setBrandFilter(brandParam);
      setCountryFilter("All Countries");
    }
  }, [location]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filtered = useMemo(() => {
    let results = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q)
      );
    }
    if (brandFilter) {
      results = results.filter(p => p.brand.toLowerCase() === brandFilter.toLowerCase());
    } else {
      if (typeFilter !== "All Types") results = results.filter(p => p.type === typeFilter);
      if (countryFilter !== "All Countries") results = results.filter(p => p.country === countryFilter);
    }
    results = results.filter(p => p.price === 0 || p.price <= priceMax);

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
  }, [products, search, typeFilter, countryFilter, brandFilter, priceMax, sort]);

  const activeFilters = [
    brandFilter ? `Brand: ${brandFilter}` : null,
    typeFilter !== "All Types" ? typeFilter : null,
    countryFilter !== "All Countries" ? countryFilter : null,
    priceMax < 10000 ? `≤ HK$${priceMax}` : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[hsl(355,62%,28%)] text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-white/60 mb-3">Our Collection</p>
          <h1 className="font-display text-4xl md:text-5xl font-light mb-2">Wine Catalogue 酒款目錄</h1>
          <p className="font-body text-white/70 text-sm">{products.length} wines across 23 exclusive brands</p>
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
            <div>
              <label className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                Max Price: HK${priceMax >= 10000 ? "No limit" : priceMax.toLocaleString()}
              </label>
              <input
                type="range"
                min={100} max={10000} step={100}
                value={priceMax}
                onChange={e => setPriceMax(Number(e.target.value))}
                className="w-full accent-[hsl(355,62%,28%)]"
                data-testid="price-range"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1 font-body">
                <span>HK$100</span><span>No limit</span>
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
                  if (f?.startsWith("≤")) setPriceMax(10000);
                }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={() => { setBrandFilter(null); setTypeFilter("All Types"); setCountryFilter("All Countries"); setPriceMax(10000); }}
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
          <div className="text-center py-20">
            <p className="font-display text-2xl text-muted-foreground mb-3">No wines found</p>
            <p className="font-body text-sm text-muted-foreground mb-6">Try adjusting your filters or search term.</p>
            <Button variant="outline" onClick={() => { setSearch(""); setTypeFilter("All Types"); setCountryFilter("All Countries"); setPriceMax(10000); }}>
              Clear filters
            </Button>
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
