import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Search, SlidersHorizontal, X, ChevronDown, Wine, Star, MapPin, Calendar, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FineRareItem {
  code: string;
  type: string;
  country: string;
  region: string;
  producer: string;
  appellation: string;
  name_zh: string;
  vintage: string;
  volume: string;
  qty_hk: number | null;
  qty_swiss: number | null;
  price_hkd: number | null;
  rating_wa: number | null;
  rating_bh: number | null;
  remarks: string;
  packing: string;
}

// ─── Gold divider SVG ─────────────────────────────────────────────────────────
function GoldDivider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
        <polygon points="10,1 12,8 19,8 13.5,12.5 15.5,19.5 10,15 4.5,19.5 6.5,12.5 1,8 8,8" fill="hsl(43,85%,55%)" opacity="0.7" />
      </svg>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
    </div>
  );
}

// ─── Score badge ─────────────────────────────────────────────────────────────
function ScoreBadge({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] text-amber-400/60 uppercase tracking-widest font-medium">{label}</span>
      <span className="text-lg font-display font-bold text-amber-300 leading-none">{score}</span>
    </div>
  );
}

// ─── Enquire button ───────────────────────────────────────────────────────────
function EnquireBtn({ item }: { item: FineRareItem }) {
  const subject = encodeURIComponent(`Enquiry: ${item.producer} ${item.appellation} ${item.vintage}`);
  const body = encodeURIComponent(
    `Hi Terroir & Craft,\n\nI am interested in the following bottle from your Fine & Rare collection:\n\n` +
    `Producer: ${item.producer}\nAppellation: ${item.appellation}\nVintage: ${item.vintage}\nVolume: ${item.volume}\nCode: ${item.code}\n\nPlease advise on availability and pricing.\n\nThank you.`
  );
  return (
    <a
      href={`mailto:info@terroirandcraft.com?subject=${subject}&body=${body}`}
      className="block w-full text-center py-2 px-3 text-xs font-medium uppercase tracking-widest rounded
        border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400
        transition-all duration-200"
      data-testid={`enquire-${item.code}`}
    >
      Enquire
    </a>
  );
}

// ─── Wine Card ────────────────────────────────────────────────────────────────
function FRCard({ item }: { item: FineRareItem }) {
  const inHK = item.qty_hk && item.qty_hk > 0;
  const hasRating = item.rating_wa || item.rating_bh;
  const isLargeFormat = item.volume && item.volume !== "750ml";

  return (
    <div
      className="group relative flex flex-col rounded-xl overflow-hidden border border-amber-900/30
        bg-gradient-to-b from-[hsl(0,0%,10%)] to-[hsl(0,0%,7%)]
        hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(180,130,50,0.15)]
        transition-all duration-300"
      data-testid={`frc-${item.code}`}
    >
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      {/* Body */}
      <div className="flex-1 p-5 flex flex-col gap-3">
        {/* Badges row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
              item.type === "Red"
                ? "bg-[hsl(355,60%,25%)]/60 text-[hsl(355,70%,70%)]"
                : item.type === "White"
                ? "bg-[hsl(50,40%,20%)]/60 text-amber-200"
                : item.type === "Dessert"
                ? "bg-[hsl(280,30%,25%)]/60 text-purple-300"
                : "bg-white/10 text-white/60"
            }`}>
              {item.type}
            </span>
            {isLargeFormat && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-800/40 text-amber-300">
                {item.volume}
              </span>
            )}
            {inHK && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-900/40 text-emerald-400">
                HK Stock
              </span>
            )}
          </div>
          {/* Vintage */}
          {item.vintage && (
            <span className="shrink-0 font-display text-amber-400/80 text-sm font-semibold">{item.vintage}</span>
          )}
        </div>

        {/* Producer */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500/60 font-medium mb-0.5">{item.country} · {item.region}</p>
          <h3 className="font-display text-base font-semibold text-amber-100 leading-snug group-hover:text-amber-200 transition-colors">
            {item.producer}
          </h3>
          <p className="text-sm text-white/60 leading-snug mt-0.5">{item.appellation}</p>
          {item.name_zh && (
            <p className="text-xs text-amber-400/50 mt-1 leading-snug">{item.name_zh}</p>
          )}
        </div>

        {/* Ratings */}
        {hasRating && (
          <div className="flex gap-4">
            {item.rating_wa && <ScoreBadge label="WA/RP" score={item.rating_wa} />}
            {item.rating_bh && <ScoreBadge label="BH" score={item.rating_bh} />}
          </div>
        )}

        {/* Remarks */}
        {item.remarks && (
          <p className="text-[11px] text-white/40 italic">{item.remarks}</p>
        )}
      </div>

      {/* Bottom — price + enquire */}
      <div className="border-t border-amber-900/30 px-5 py-4 flex items-center justify-between gap-3">
        <div>
          {item.price_hkd ? (
            <>
              <p className="text-[10px] text-amber-500/50 uppercase tracking-widest">List Price</p>
              <p className="font-display text-amber-300 font-bold text-lg leading-none">
                HK${item.price_hkd.toLocaleString()}
              </p>
            </>
          ) : (
            <p className="text-xs text-white/30 italic">Price on request</p>
          )}
        </div>
        <div className="w-28 shrink-0">
          <EnquireBtn item={item} />
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function FineRarePage() {
  const { data: items = [], isLoading } = useQuery<FineRareItem[]>({
    queryKey: ["/api/fine-rare"],
    queryFn: () => apiRequest("GET", "/api/fine-rare").then(r => r.json()),
  });

  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterRegion, setFilterRegion] = useState("All");
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "vintage_asc" | "vintage_desc" | "producer">("producer");
  const [showFilters, setShowFilters] = useState(false);

  // Derived filter options
  const countries = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.country).filter(Boolean))).sort()], [items]);
  const types = useMemo(() => ["All", ...Array.from(new Set(items.map(i => i.type).filter(Boolean))).sort()], [items]);
  const regions = useMemo(() => {
    const source = filterCountry === "All" ? items : items.filter(i => i.country === filterCountry);
    return ["All", ...Array.from(new Set(source.map(i => i.region).filter(Boolean))).sort()];
  }, [items, filterCountry]);

  // Filtered + sorted
  const filtered = useMemo(() => {
    let list = [...items];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.producer.toLowerCase().includes(q) ||
        i.appellation.toLowerCase().includes(q) ||
        i.name_zh.includes(q) ||
        i.vintage.includes(q) ||
        i.region.toLowerCase().includes(q) ||
        i.country.toLowerCase().includes(q)
      );
    }
    if (filterCountry !== "All") list = list.filter(i => i.country === filterCountry);
    if (filterType !== "All") list = list.filter(i => i.type === filterType);
    if (filterRegion !== "All") list = list.filter(i => i.region === filterRegion);

    list.sort((a, b) => {
      if (sortBy === "price_asc") return (a.price_hkd ?? 0) - (b.price_hkd ?? 0);
      if (sortBy === "price_desc") return (b.price_hkd ?? 0) - (a.price_hkd ?? 0);
      if (sortBy === "vintage_asc") return (a.vintage ?? "").localeCompare(b.vintage ?? "");
      if (sortBy === "vintage_desc") return (b.vintage ?? "").localeCompare(a.vintage ?? "");
      return a.producer.localeCompare(b.producer);
    });
    return list;
  }, [items, search, filterCountry, filterType, filterRegion, sortBy]);

  const clearFilters = () => {
    setSearch(""); setFilterCountry("All"); setFilterType("All"); setFilterRegion("All");
  };
  const hasFilters = search || filterCountry !== "All" || filterType !== "All" || filterRegion !== "All";

  // Group by producer for the listing
  const grouped = useMemo(() => {
    const map = new Map<string, FineRareItem[]>();
    for (const item of filtered) {
      const key = item.producer || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="min-h-screen bg-[hsl(0,0%,6%)] text-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-20"
            style={{ background: "radial-gradient(ellipse, hsl(43,85%,55%) 0%, transparent 70%)" }} />
        </div>

        {/* Decorative frame lines */}
        <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-amber-600/30 pointer-events-none" />
        <div className="absolute top-6 right-6 w-16 h-16 border-r-2 border-t-2 border-amber-600/30 pointer-events-none" />
        <div className="absolute bottom-6 left-6 w-16 h-16 border-l-2 border-b-2 border-amber-600/30 pointer-events-none" />
        <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-amber-600/30 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center relative z-10">
          {/* Eyebrow */}
          <p className="text-[11px] uppercase tracking-[0.35em] text-amber-500/70 font-medium mb-6">
            Terroir & Craft — Private Cellar
          </p>

          {/* Title */}
          <h1 className="font-display text-5xl sm:text-6xl font-bold mb-4 leading-none tracking-tight">
            <span className="text-white">Fine </span>
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, hsl(43,85%,65%) 0%, hsl(43,70%,45%) 50%, hsl(43,85%,60%) 100%)" }}>
              & Rare
            </span>
          </h1>

          {/* Chinese subtitle */}
          <p className="text-sm text-amber-400/60 tracking-[0.15em] mb-6 font-medium">珍稀藏酒</p>

          {/* Description */}
          <p className="text-white/50 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-2">
            Curated from the world's most legendary estates — DRC, Henri Jayer, Petrus, Mouton Rothschild and beyond.
            Each bottle available by private enquiry.
          </p>
          <p className="text-white/30 text-xs tracking-wide">
            All prices listed are HKD. Enquire for availability & provenance documentation.
          </p>

          <GoldDivider />

          {/* Stats */}
          <div className="flex justify-center gap-10 sm:gap-16">
            {[
              { value: items.length.toString(), label: "Bottles" },
              { value: [...new Set(items.map(i => i.producer).filter(Boolean))].length.toString(), label: "Producers" },
              { value: [...new Set(items.map(i => i.country).filter(Boolean))].length.toString(), label: "Countries" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl font-bold text-amber-300">{s.value}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sticky filter bar ─────────────────────────────────────────────── */}
      <div className="sticky top-[65px] z-30 bg-[hsl(0,0%,6%)]/95 backdrop-blur border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-500/50" />
            <input
              type="text"
              placeholder="Search producer, appellation…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-md border border-amber-900/40 bg-white/5
                text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50
                focus:bg-white/8 transition-all"
              data-testid="fr-search"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-all ${
              showFilters || hasFilters
                ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                : "border-amber-900/40 text-white/50 hover:border-amber-700/50 hover:text-white/70"
            }`}
            data-testid="fr-filter-toggle"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5" />}
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none pl-3 pr-7 py-1.5 rounded-md border border-amber-900/40 bg-white/5
                text-white/60 text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer"
              data-testid="fr-sort"
            >
              <option value="producer">Sort: Producer</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="vintage_asc">Vintage: Old → New</option>
              <option value="vintage_desc">Vintage: New → Old</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
          </div>

          {/* Results count */}
          <span className="ml-auto text-[11px] text-white/30 shrink-0 hidden sm:block">
            {filtered.length} bottles
          </span>
        </div>

        {/* Expanded filter panel */}
        {showFilters && (
          <div className="border-t border-amber-900/30 px-4 sm:px-6 py-3 flex flex-wrap gap-4 items-end">
            {/* Country */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-amber-500/50 mb-1.5">Country</p>
              <div className="flex flex-wrap gap-1.5">
                {countries.map(c => (
                  <button
                    key={c}
                    onClick={() => { setFilterCountry(c); setFilterRegion("All"); }}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                      filterCountry === c
                        ? "bg-amber-600/30 border border-amber-500/60 text-amber-300"
                        : "border border-amber-900/30 text-white/40 hover:border-amber-700/50 hover:text-white/60"
                    }`}
                    data-testid={`fr-country-${c}`}
                  >{c}</button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-amber-500/50 mb-1.5">Type</p>
              <div className="flex flex-wrap gap-1.5">
                {types.map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                      filterType === t
                        ? "bg-amber-600/30 border border-amber-500/60 text-amber-300"
                        : "border border-amber-900/30 text-white/40 hover:border-amber-700/50 hover:text-white/60"
                    }`}
                    data-testid={`fr-type-${t}`}
                  >{t}</button>
                ))}
              </div>
            </div>

            {/* Region */}
            {filterCountry !== "All" && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-amber-500/50 mb-1.5">Region</p>
                <div className="flex flex-wrap gap-1.5">
                  {regions.map(r => (
                    <button
                      key={r}
                      onClick={() => setFilterRegion(r)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                        filterRegion === r
                          ? "bg-amber-600/30 border border-amber-500/60 text-amber-300"
                          : "border border-amber-900/30 text-white/40 hover:border-amber-700/50 hover:text-white/60"
                      }`}
                    >{r}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear */}
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-amber-500/60 hover:text-amber-400 underline underline-offset-2 transition-colors">
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Main listing ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-amber-900/20 bg-white/3 h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-white/30 text-sm">No bottles match your search.</p>
            {hasFilters && <button onClick={clearFilters} className="mt-3 text-amber-500/60 text-xs underline">Clear filters</button>}
          </div>
        ) : sortBy === "producer" ? (
          /* Grouped by producer view */
          <div className="space-y-12">
            {grouped.map(([producer, bottles]) => (
              <div key={producer}>
                {/* Producer header */}
                <div className="flex items-center gap-4 mb-5">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-amber-200">{producer || "Other"}</h2>
                    <p className="text-[11px] text-amber-500/50 uppercase tracking-widest mt-0.5">
                      {bottles[0]?.country} · {bottles[0]?.region} · {bottles.length} bottle{bottles.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-amber-900/40 to-transparent ml-2" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {bottles.map(item => <FRCard key={item.code} item={item} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Flat grid for non-producer sort */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(item => <FRCard key={item.code} item={item} />)}
          </div>
        )}
      </div>

      {/* ── Private enquiry CTA ───────────────────────────────────────────── */}
      <section className="border-t border-amber-900/30 bg-[hsl(0,0%,4%)]">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <GoldDivider />
          <h2 className="font-display text-3xl font-semibold text-amber-100 mb-3">Private Cellar Enquiries</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-xl mx-auto">
            Our Fine & Rare collection is available by appointment and private enquiry only.
            We provide full provenance documentation, bonded warehouse storage in Hong Kong & Switzerland,
            and white-glove delivery.
          </p>
          <a
            href="mailto:info@terroirandcraft.com?subject=Fine%20%26%20Rare%20Enquiry"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-md font-medium text-sm uppercase tracking-widest
              border border-amber-500/50 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400
              transition-all duration-200"
          >
            Contact Our Cellar Team
          </a>
          <p className="mt-6 text-[11px] text-white/20 tracking-wide">
            +852 2981 8868 · info@terroirandcraft.com
          </p>
          <GoldDivider />
        </div>
      </section>
    </div>
  );
}
