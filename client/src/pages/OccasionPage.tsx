import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { API_BASE } from "@/lib/queryClient";

const OCCASIONS = [
  {
    key: "gifts",
    label: "Gifts",
    labelZh: "送禮之選",
    desc: "Curated bottles perfect for gifting — premium, well-presented, and sure to impress.",
    descZh: "精心挑選的送禮酒款，高質又體面",
    img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80&auto=format&fit=crop",
  },
  {
    key: "under300",
    label: "Under HK$300",
    labelZh: "包括 Promotion 價低於 HK$300",
    desc: "Great value wines under HK$300 — including promotion prices. Quality without compromise.",
    descZh: "超值之選，包括促銷價低於 HK$300 的酒款",
    img: "https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=800&q=80&auto=format&fit=crop",
  },
  {
    key: "easyreds",
    label: "Easy-Drinking Reds",
    labelZh: "易飲紅酒",
    desc: "Smooth, juicy and approachable reds — perfect for any night of the week.",
    descZh: "順口易飲，任何場合都啱飲的紅酒",
    img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80&auto=format&fit=crop",
    overlay: "linear-gradient(to top, rgba(50,15,15,0.88) 0%, rgba(50,15,15,0.25) 60%, rgba(50,15,15,0.0) 100%)",
  },
  {
    key: "champagne",
    label: "Champagne & Sparkling",
    labelZh: "香檳及氣泡酒",
    desc: "Fine bubbles for every celebration — from everyday sparkling to prestige Champagne.",
    descZh: "慶祝時刻的最佳拍檔，由日常氣泡到頂級香檳",
    img: `${API_BASE}/champagne-boizel.jpg`,
    overlay: "linear-gradient(to top, rgba(8,6,3,0.88) 0%, rgba(8,6,3,0.25) 60%, rgba(8,6,3,0.0) 100%)",
  },
  {
    key: "staffpicks",
    label: "Staff Picks",
    labelZh: "員工精選",
    desc: "Our current top picks — personally recommended by the Terroir & Craft team.",
    descZh: "天地人酒業團隊的個人推薦，每款都係心頭好",
    img: "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800&q=80&auto=format&fit=crop",
    overlay: "linear-gradient(to top, rgba(8,20,28,0.90) 0%, rgba(8,20,28,0.3) 60%, rgba(8,20,28,0.0) 100%)",
  },
  {
    key: "hotpot",
    label: "HK Hotpot 打邊爐",
    labelZh: "火鍋配酒",
    desc: "The perfect wines to pair with Hong Kong-style hotpot — warming, flavourful and fun.",
    descZh: "打邊爐首選配酒，暖笠笠又好飲",
    img: `${API_BASE}/hotpot.jpg`,
  },
  {
    key: "bbq",
    label: "BBQ & Grill",
    labelZh: "BBQ 燒烤配酒",
    desc: "Bold, fruit-forward wines that stand up to smoky, chargrilled flavours.",
    descZh: "配搭燒烤的最佳拍檔，果味豐富，層次分明",
    img: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80&auto=format&fit=crop",
  },
];

export default function OccasionPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[hsl(355,62%,28%)] text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-white/60 mb-3">Shop by</p>
          <h1 className="font-display text-4xl md:text-5xl font-light mb-2">By Occasion 場合選酒</h1>
          <p className="font-body text-white/70 text-sm">Find the perfect bottle for every moment</p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {OCCASIONS.map(occ => (
            <Link key={occ.key} href={`/wines?occasion=${occ.key}`}>
              <a className="group relative rounded-2xl overflow-hidden block cursor-pointer"
                style={{ aspectRatio: "4/3" }}>
                {/* Background */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${occ.img}')` }}
                />
                {/* Overlay */}
                <div
                  className="absolute inset-0 transition-all duration-300"
                  style={{ background: occ.overlay || "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.0) 100%)" }}
                />
                {/* Text */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="font-script text-3xl text-white leading-tight mb-1">
                    {occ.label}
                  </h2>
                  <p className="font-body text-xs text-white/65 mb-3">{occ.descZh}</p>
                  <span className="inline-flex items-center gap-1.5 font-body text-xs font-medium text-white/80 group-hover:text-white group-hover:gap-2.5 transition-all">
                    Browse wines <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
