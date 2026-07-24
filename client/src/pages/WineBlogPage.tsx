import { Link } from "wouter";
import SeoHead from "@/components/SeoHead";

// ── Blog post metadata ────────────────────────────────────────────────────────
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  titleZh: string;
  date: string;           // ISO date
  category: string;
  categoryZh: string;
  heroImage: string;
  excerpt: string;
  excerptZh: string;
  component: React.FC;
}

// ── Morey-Coffinet post content ───────────────────────────────────────────────
function MoreyCoffinetPost() {
  const wines = [
    {
      name: "Bourgogne Chardonnay Côte d'Or BIO 2024",
      type: "White", bh: 87, bhNote: "87/100, 2028+",
      price: "HK$265", listPrice: "HK$310",
      note: `"An expressive nose freely reveals its aromas of petrol, apple and lemon zest. The racy, delicious and attractively textured middle weight flavors deliver very good depth and persistence for a wine of this level on the lightly austere finale. Worth a look."`,
    },
    {
      name: "Chassagne‑Montrachet Blanc BIO 2024",
      type: "White", bh: 89, bhNote: "89/100, 2030+",
      price: "HK$578", listPrice: "HK$680",
      note: `"An equally expressive but better layered nose also freely reveals its notes of rosemary oil, white orchard fruit and just grated citrus rind. There is again an attractive texture to the rich and succulent but vibrant flavors that deliver solid depth and persistence on the balanced, clean and agreeably dry finale. One to consider."`,
    },
    {
      name: "Chassagne‑Montrachet 1er Cru En Cailleret BIO 2024",
      type: "White", bh: 93, bhNote: "93/100, 2034+",
      price: "HK$900", listPrice: "HK$950",
      note: `"The super-sleek and gorgeously textured middle weight flavors display much more evident minerality that adds a sense of lift to the very dry but not especially austere finish that delivers excellent length. This is a lovely Cailleret that should easily repay up to a decade of keeping."`,
    },
    {
      name: "Chassagne‑Montrachet 1er Cru Les Fairendes BIO 2024",
      type: "White", bh: 91, bhNote: "91/100, 2032+",
      price: "HK$900", listPrice: "HK$950",
      note: `"A markedly more floral-suffused nose, especially acacia and carnation. There is better volume and overall size to the delicious and sappy medium-bodied flavors that exhibit fine length on the slightly more structured finale."`,
    },
    {
      name: "Chassagne‑Montrachet 1er Cru La Romanée BIO 2024",
      type: "White", bh: 92, bhNote: "92/100, 2032+",
      price: "HK$1,080", listPrice: "HK$1,190",
      note: `"From a .7 ha parcel of 50+ year old vines. There is a bit more size and weight to the bigger-bodied flavors that exude both evident minerality and obviously power on the medium dry, focused, balanced and lingering finale."`,
    },
    {
      name: "Puligny‑Montrachet 1er Cru Les Pucelles BIO 2024",
      type: "White", bh: null, bhNote: "Not Rated",
      price: "HK$1,580", listPrice: "HK$1,830",
      note: `"Ripe and airy aromas of white peach, honeysuckle, acacia blossom and spice wisps are set off by subtle wood influence. Succulent and seductive flavors — a tough wine to evaluate in its current state."`,
    },
    {
      name: "Bâtard‑Montrachet Grand Cru BIO 2024",
      type: "White", bh: 95, bhNote: "95/100, 2036+", isGrandCru: true,
      price: "HK$4,680", listPrice: "HK$5,160",
      note: `"Outstanding volume to the utterly delicious and tautly muscular flavors that display stunningly good persistence on the balanced, very dry and compact finale. Despite being clearly built-to-age, this is actually quite an elegant Bâtard that should richly reward a decade plus of keeping. If you can find, don't hesitate."`,
    },
    {
      name: "Chassagne‑Montrachet Rouge 1er Cru Morgeot BIO 2024",
      type: "Red", bh: null, bhNote: null,
      price: "HK$620", listPrice: "HK$680",
      note: "成熟紅黑果、香料、甘草與泥土氣息，酒體中等偏飽滿，單寧有力度但細膩，酸度令結構保持立體。",
    },
    {
      name: "Chassagne‑Montrachet Rouge \"Chaumes & Chambres\" BIO 2024",
      type: "Red", bh: null, bhNote: null,
      price: "HK$460", listPrice: "HK$480",
      note: "紅櫻桃、覆盆子、玫瑰花瓣與少量香料及森林地表氣息，酒體中等、單寧幼滑但有骨幹，風格優雅細緻。",
    },
  ] as const;

  return (
    <div className="max-w-[680px] mx-auto">
      {/* Intro */}
      <div className="mb-10">
        <p className="font-body text-base text-muted-foreground leading-relaxed mb-4">
          Domaine Morey‑Coffinet 是 Chassagne‑Montrachet 兩大歷史名門 Morey 與 Coffinet 家族因婚姻而合併葡萄園誕生的酒莊，現任掌舵人 Thibault Morey（家族第十代釀酒師）自 2009 年起逐步將酒莊轉型為有機及生物動力耕作。
        </p>
        <p className="font-body text-base text-muted-foreground leading-relaxed mb-4">
          2024 年對勃艮第而言是一個挑戰重重但成果驚喜的年份。Thibault 形容整個生長季節「exceptionally challenging」—— 持續降雨、開花不理想、病害壓力不斷。最終產量在白酒低至 10 ha，產量幾乎減半。然而，在精準耕作與採收下，2024 年白酒被 Burghound 形容為清新、礦物、有骨幹，是一個「fresh and precise」的收藏年份。
        </p>
        <div className="border-l-4 border-[hsl(40,70%,50%)] pl-4 py-1 my-6 bg-amber-50/50 rounded-r">
          <p className="font-body text-sm text-muted-foreground italic leading-relaxed">
            "With the exception of the Pucelles, every wine is recommended. I would add, and I have said this before, if you're not familiar with the wines, do yourself a 'collecting favour' and try a few; you'll thank me."
          </p>
          <span className="text-xs text-muted-foreground/70 mt-1 block">— Allen Meadows, Burghound</span>
        </div>
      </div>

      {/* Wine cards */}
      <div className="space-y-5">
        {wines.map((w) => (
          <div key={w.name} className={`border rounded-xl overflow-hidden ${(w as any).isGrandCru ? 'border-amber-400 ring-1 ring-amber-200' : 'border-border'}`}>
            {(w as any).isGrandCru && (
              <div className="bg-amber-50 text-amber-800 text-[10px] font-semibold tracking-widest uppercase text-center py-1.5 border-b border-amber-200">
                ★ Grand Cru · 旗艦之作
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="font-display text-[17px] font-medium leading-snug text-foreground mb-2">{w.name}</h3>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`text-[9.5px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded ${w.type === 'White' ? 'bg-sky-50 text-sky-700' : 'bg-red-50 text-red-700'}`}>
                      {w.type === 'White' ? '⬜ White' : '🟥 Red'}
                    </span>
                    <span className="text-[9.5px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-green-50 text-green-700">BIO Certified</span>
                    <span className="text-[10px] text-muted-foreground">2024 · 750ml</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  {w.bh ? (
                    <div className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center ${(w as any).isGrandCru ? 'border-amber-500 bg-amber-50' : 'border-[hsl(40,60%,50%)] bg-amber-50/60'}`}>
                      <span className={`font-display font-bold leading-none ${(w as any).isGrandCru ? 'text-2xl text-amber-700' : 'text-xl text-[hsl(40,60%,35%)]'}`}>{w.bh}</span>
                      <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wide mt-0.5">BH</span>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full border-2 border-border flex flex-col items-center justify-center bg-muted/20">
                      <span className="text-xs font-semibold text-muted-foreground">—</span>
                      <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wide">BH</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tasting note */}
              <div className="bg-amber-50/40 border-l-[3px] border-amber-300 px-3 py-2.5 mb-4 rounded-r">
                <p className="font-body text-[12.5px] italic text-muted-foreground leading-relaxed">{w.note}</p>
                {w.bhNote && <span className="text-[10px] text-muted-foreground/70 mt-1 block not-italic">— Burghound, {w.bhNote}</span>}
              </div>

              {/* Price row */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Terroir &amp; Craft 獨家供應</div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground line-through mr-2">{w.listPrice}</span>
                  <span className="font-display text-xl font-medium text-[hsl(142,40%,28%)]">{w.price}</span>
                  <span className="text-xs text-muted-foreground ml-1">/bottle</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 p-6 bg-[hsl(30,20%,96%)] rounded-xl border border-border text-center">
        <p className="font-body text-sm text-muted-foreground mb-4">2024 年份配額極為稀少，額滿即止。如有查詢或預留，請直接聯絡我們。</p>
        <a
          href="https://wa.me/85298055609?text=你好，我想查詢 Morey-Coffinet 2024 配額"
          className="inline-block px-6 py-3 rounded-lg font-body font-medium text-sm"
          style={{ background: 'hsl(142,40%,28%)', color: '#fff', textDecoration: 'none' }}
        >
          WhatsApp 查詢 +852 9805 5609
        </a>
      </div>
    </div>
  );
}

// ── Blog post registry ────────────────────────────────────────────────────────
export const BLOG_POSTS: BlogPost[] = [
  {
    id: "morey-coffinet-2024",
    slug: "morey-coffinet-2024-vintage",
    title: "Domaine Morey-Coffinet 2024 Vintage — Burghound Review & Full Offer",
    titleZh: "Morey‑Coffinet 2024 年份 · Burghound 評分 + 全系列推介",
    date: "2026-07-24",
    category: "Producer Feature",
    categoryZh: "酒莊推介",
    heroImage: "https://www.chassagne-montrachet.com/wp-content/uploads/2020/01/071-MOREY-COFFINET.jpg",
    excerpt: "Allen Meadows (Burghound) calls the 2024 Bâtard-Montrachet a 95-point masterpiece. Full tasting notes + exclusive HK pricing inside.",
    excerptZh: "Burghound (Allen Meadows) 給予 2024 Bâtard‑Montrachet 95 分，形容「If you can find, don't hesitate」。全系列 Burghound 評分 + 天地人酒業獨家優惠價。",
    component: MoreyCoffinetPost,
  },
];

// ── Main Wine Blog Page ───────────────────────────────────────────────────────
export default function WineBlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Wine Blog | 酒識 — Terroir & Craft 天地人酒業"
        description="Wine tasting notes, producer features, vintage reports and buying guides from Terroir & Craft — exclusive HK importer for 23 premium wine brands."
        canonical="https://www.terroirandcraft.online/blog"
      />

      {/* Header */}
      <div className="border-b border-border bg-[hsl(30,20%,98%)] dark:bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center">
          <p className="font-body text-xs font-medium tracking-[0.2em] uppercase text-[hsl(40,60%,45%)] mb-3">Terroir &amp; Craft · 天地人酒業</p>
          <h1 className="font-display text-4xl sm:text-5xl font-light text-foreground mb-3">Wine Blog <span className="text-muted-foreground text-3xl">· 酒識</span></h1>
          <p className="font-body text-muted-foreground text-sm max-w-lg mx-auto">Producer features, vintage reports, tasting notes and buying guides from our team of specialists.</p>
        </div>
      </div>

      {/* Post grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {BLOG_POSTS.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <div className="group block rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-200 cursor-pointer">
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={post.heroImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9.5px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">{post.categoryZh}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(post.date).toLocaleDateString('zh-HK', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <h2 className="font-display text-[17px] font-medium leading-snug mb-2 text-foreground group-hover:text-[hsl(40,60%,35%)] transition-colors">{post.titleZh}</h2>
                  <p className="font-body text-[12.5px] text-muted-foreground leading-relaxed line-clamp-3">{post.excerptZh}</p>
                  <div className="mt-4 text-[11px] font-semibold text-[hsl(142,40%,35%)] uppercase tracking-wider">閱讀全文 →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
