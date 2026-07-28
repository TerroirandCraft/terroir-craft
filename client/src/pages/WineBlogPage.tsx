import { Link } from "wouter";
import SeoHead from "@/components/SeoHead";

// ── Blog post metadata ────────────────────────────────────────────────────────
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  titleZh: string;
  date: string;
  category: string;
  categoryZh: string;
  heroImage: string;
  excerpt: string;
  excerptZh: string;
  component: React.FC;
}

// ── Shared helpers ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-body text-[9px] font-semibold tracking-[0.25em] uppercase text-[hsl(40,60%,45%)] mb-2">{children}</p>;
}
function Rule({ color = "hsl(40,60%,50%)" }: { color?: string }) {
  return <div className="w-10 h-[1px] mb-5" style={{ background: color }} />;
}
function Quote({ text, source }: { text: string; source: string }) {
  return (
    <div className="border-l-4 border-[hsl(40,60%,50%)] pl-4 py-1 my-6 bg-amber-50/50 rounded-r">
      <p className="font-body text-sm text-muted-foreground italic leading-relaxed">{text}</p>
      <span className="text-xs text-muted-foreground/70 mt-1 block">— {source}</span>
    </div>
  );
}

// ── Morey-Coffinet post ───────────────────────────────────────────────────────
function MoreyCoffinetPost() {
  const wines = [
    { name: "Bourgogne Chardonnay Cote d'Or BIO 2024", type: "White", bh: 87, bhNote: "87/100, 2028+", price: "HK$265", listPrice: "HK$310", note: "An expressive nose freely reveals its aromas of petrol, apple and lemon zest. The racy, delicious and attractively textured middle weight flavors deliver very good depth and persistence for a wine of this level on the lightly austere finale. Worth a look." },
    { name: "Bourgogne Cote d'Or Pinot Noir Rouge BIO 2024", type: "Red", bh: null, bhNote: null, price: "HK$270", listPrice: "HK$310", note: "Red berries, cherries, spice and earthy notes. Fine-grained tannins, vibrant acidity and the elegant backbone typical of Burgundy." },
    { name: "Chassagne-Montrachet Blanc BIO 2024", type: "White", bh: 89, bhNote: "89/100, 2030+", price: "HK$578", listPrice: "HK$680", note: "An equally expressive but better layered nose freely reveals its notes of rosemary oil, white orchard fruit and just grated citrus rind. There is an attractive texture to the rich and succulent but vibrant flavors that deliver solid depth and persistence on the balanced, clean and agreeably dry finale. One to consider." },
    { name: "Chassagne-Montrachet Rouge Chaumes & Chambres BIO 2024", type: "Red", bh: null, bhNote: null, price: "HK$460", listPrice: "HK$480", note: "Red cherry, raspberry, rose petal with light spice and forest floor. Medium-bodied with silky tannins and an elegant, refined structure." },
    { name: "Chassagne-Montrachet 1er Cru En Cailleret BIO 2024", type: "White", bh: 93, bhNote: "93/100, 2034+", isSV: true, price: "HK$900", listPrice: "HK$950", note: "The super-sleek and gorgeously textured middle weight flavors display much more evident minerality that adds a sense of lift to the very dry but not especially austere finish that delivers excellent length. This is a lovely Cailleret that should easily repay up to a decade of keeping." },
    { name: "Chassagne-Montrachet 1er Cru Les Fairendes BIO 2024", type: "White", bh: 91, bhNote: "91/100, 2032+", isSV: true, price: "HK$900", listPrice: "HK$950", note: "A markedly more floral-suffused nose, especially acacia and carnation, displays additional notes of petrol, white peach and zest. There is better volume and overall size to the delicious and sappy medium-bodied flavors that exhibit fine length on the slightly more structured finale." },
    { name: "Chassagne-Montrachet 1er Cru La Romanee BIO 2024", type: "White", bh: 92, bhNote: "92/100, 2032+", isSV: true, price: "HK$1,080", listPrice: "HK$1,190", note: "From a .7 ha parcel of 50+ year old vines. There is a bit more size and weight to the bigger-bodied flavors that exude both evident minerality and obviously power on the medium dry, focused, balanced and lingering finale that is not quite as structured. A few years of keeping should help." },
    { name: "Puligny-Montrachet 1er Cru Les Pucelles BIO 2024", type: "White", bh: null, bhNote: "Not Rated", isSV: true, price: "HK$1,580", listPrice: "HK$1,830", note: "Near Grand Cru quality. Ripe and airy aromas of white peach, honeysuckle, acacia blossom and spice wisps. Succulent and seductive flavors with elegant mineral length." },
    { name: "Batard-Montrachet Grand Cru BIO 2024", type: "White", bh: 95, bhNote: "95/100, 2036+", isSV: true, isGrandCru: true, price: "HK$4,680", listPrice: "HK$5,160", note: "Outstanding volume to the utterly delicious and tautly muscular flavors that display stunningly good persistence on the balanced, very dry and compact finale. Despite being clearly built-to-age, this is quite an elegant Batard that should richly reward a decade plus of keeping. If you can find, don't hesitate." },
    { name: "Chassagne-Montrachet Rouge 1er Cru Morgeot BIO 2024", type: "Red", bh: null, bhNote: null, isSV: true, price: "HK$620", listPrice: "HK$680", note: "Ripe red and black fruit, spice, liquorice and earthy notes. Medium-full body with structured yet fine tannins and lively acidity that keeps the wine vibrant and age-worthy." },
  ] as const;

  return (
    <div className="max-w-[680px] mx-auto">

      {/* Estate Story */}
      <div className="mb-10">
        <SectionLabel>酒莊故事 · Histoire du Domaine</SectionLabel>
        <Rule />
        <h2 className="font-display text-3xl font-light text-foreground mb-5">兩大家族聯姻的 Chassagne 傳奇</h2>
        <p className="font-body text-base text-muted-foreground leading-relaxed mb-4">
          Domaine Morey-Coffinet 是 Chassagne-Montrachet 兩大歷史名門 Morey 與 Coffinet 家族因婚姻而合併葡萄園誕生的酒莊，根基可追溯至 19 世紀的勃艮第傳統。酒莊於 1980 年由 Michel Morey 及其妻子 Fabienne Coffinet 正式建立，把 Marc Morey 家族在 Chassagne 的優質地塊，與 Coffinet 一脈的老牌園區整合成一個專注風土的精品酒莊。
        </p>
        <p className="font-body text-base text-muted-foreground leading-relaxed mb-4">
          現任掌舵人 <strong>Thibault Morey</strong> 為家族第十代釀酒師，自 2009 年起全面接管，逐步將酒莊升級為有機及生物動力耕作，令每一支酒都更真實呈現 Chassagne 的礦物感與張力。
        </p>
        <Quote text="I like to make wines that show pure, precise sense of place. If you are not familiar with the wines, do yourself a collecting favour and try a few — you will thank me." source="Thibault Morey, Domaine Morey-Coffinet" />
      </div>

      {/* Terroir */}
      <div className="mb-10 p-6 bg-[hsl(142,20%,12%)] rounded-xl text-white">
        <SectionLabel>葡萄園版圖 · Terroir</SectionLabel>
        <div className="w-10 h-[1px] bg-[hsl(40,60%,50%)] mb-5" />
        <h3 className="font-display text-2xl font-light text-white mb-4">Cote de Beaune 心臟地帶的風土資源</h3>
        <p className="font-body text-sm leading-relaxed mb-3" style={{color:'rgba(255,255,255,0.72)'}}>
          酒莊坐落於 Cote de Beaune 心臟地帶的 Chassagne-Montrachet，葡萄園約 8.5–9 公頃，當中約 <strong className="text-white">80% 種植 Chardonnay、20% 種植 Pinot Noir</strong>。
        </p>
        <p className="font-body text-sm leading-relaxed" style={{color:'rgba(255,255,255,0.72)'}}>
          地塊集中在白酒最精華地段，涵蓋多個 Chassagne-Montrachet 一級園（La Romanee、En Cailleret、Les Fairendes 等），以及享負盛名的 <strong className="text-white">Batard-Montrachet Grand Cru</strong>，另外亦擁有 Puligny-Montrachet 1er Cru Les Pucelles 等頂級風土。
        </p>
      </div>

      {/* Biodynamic */}
      <div className="mb-10">
        <SectionLabel>生物動力哲學 · Biodynamie</SectionLabel>
        <Rule />
        <h3 className="font-display text-2xl font-light text-foreground mb-4">讓土地恢復生命力</h3>
        <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
          Thibault Morey 的核心理念，是令葡萄園成為多元共生的生態系統。酒莊早於 2000 年代開始停用除草劑，2010 年代完成有機轉型，並逐步導入生物動力法（Biodynamic）。
        </p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            { t: "土壤生命", d: "生草覆蓋、牛角糞及矽石生物動力製劑、草本茶提升葡萄樹免疫力" },
            { t: "傳統耕作", d: "部分頂級地塊採用馬匹耕作及羊群放牧除草，配合電動拖拉機" },
            { t: "礦物純淨度", d: "在極端天氣下，仍能造出兼具成熟果味與清晰酸度、張力十足的酒款" },
            { t: "精準採收", d: "嚴格篩選採收時機，令 2024 年份兼具天然清新酸度與豐滿中段礦物能量" },
          ].map(p => (
            <div key={p.t} className="p-4 rounded-lg border border-border bg-muted/20">
              <div className="font-body text-xs font-semibold text-foreground mb-1">{p.t}</div>
              <div className="font-body text-xs text-muted-foreground leading-relaxed">{p.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2024 Vintage */}
      <div className="mb-10 p-5 rounded-xl" style={{background:'hsl(40,60%,50%)'}}>
        <p className="font-body text-[9px] font-semibold tracking-[0.22em] uppercase text-white/70 mb-2">2024 Burgundy Vintage · 年份概覽</p>
        <p className="font-body text-sm text-white leading-relaxed">
          2024 年是產量偏低但白酒表現亮眼的年份，整體減產約三成。Thibault 形容整個生長季節「exceptionally challenging」— 持續降雨、開花不理想、病害壓力不斷。然而在精準耕作與採收下，Burghound 形容 2024 年白酒為「<strong>fresh, precise, mineral</strong>」，是一個具備高陳年潛力的收藏年份。
        </p>
        <div className="mt-3 pt-3 border-t border-white/20">
          <p className="font-body text-[10px] italic text-white/80">"With the exception of the Pucelles, every wine is recommended. Do yourself a collecting favour and try a few — you'll thank me."</p>
          <span className="font-body text-[9px] text-white/60 block mt-1">— Allen Meadows, Burghound</span>
        </div>
      </div>

      {/* Wine list */}
      <div className="mb-8">
        <SectionLabel>2024 全系列 · Complete Selection</SectionLabel>
        <Rule />
        <h3 className="font-display text-2xl font-light text-foreground mb-2">由入門到巔峰的完整梯度</h3>
        <p className="font-body text-[11px] text-muted-foreground mb-6">BH = Burghound (Allen Meadows) · 全球最權威 Burgundy 評論 · 2025 年最新評分</p>
        <div className="space-y-4">
          {wines.map((w: any) => (
            <div key={w.name} className={`border rounded-xl overflow-hidden ${w.isGrandCru ? 'border-amber-400 ring-1 ring-amber-200' : w.isSV ? 'border-[hsl(40,60%,60%)]' : 'border-border'}`}>
              {w.isGrandCru && (
                <div className="bg-amber-50 text-amber-800 text-[10px] font-semibold tracking-widest uppercase text-center py-1.5 border-b border-amber-200">
                  ★ Grand Cru · 旗艦之作
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h4 className="font-display text-[16px] font-medium leading-snug text-foreground mb-2">{w.name}</h4>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className={`text-[9.5px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded ${w.type === 'White' ? 'bg-sky-50 text-sky-700' : 'bg-red-50 text-red-700'}`}>
                        {w.type === 'White' ? 'White 白酒' : 'Red 紅酒'}
                      </span>
                      <span className="text-[9.5px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-green-50 text-green-700">BIO Certified</span>
                      {w.isSV && <span className="text-[9.5px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700">★ Single Vineyard</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    {w.bh ? (
                      <div className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center ${w.isGrandCru ? 'border-amber-500 bg-amber-50' : 'border-[hsl(40,60%,50%)] bg-amber-50/60'}`}>
                        <span className={`font-display font-bold leading-none ${w.isGrandCru ? 'text-2xl text-amber-700' : 'text-xl text-[hsl(40,60%,35%)]'}`}>{w.bh}</span>
                        <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wide mt-0.5">BH</span>
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full border-2 border-border flex flex-col items-center justify-center bg-muted/20">
                        <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wide">BH</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-amber-50/40 border-l-[3px] border-amber-300 px-3 py-2.5 mb-4 rounded-r">
                  <p className="font-body text-[12.5px] italic text-muted-foreground leading-relaxed">{w.note}</p>
                  {w.bhNote && <span className="text-[10px] text-muted-foreground/70 mt-1 block not-italic">— Burghound, {w.bhNote}</span>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Terroir & Craft 獨家供應</div>
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
      </div>

      {/* CTA */}
      <div className="p-6 bg-[hsl(142,35%,12%)] rounded-xl text-center">
        <p className="font-body text-sm text-white/75 mb-4">2024 年份配額極為稀少，額滿即止。</p>
        <a href="https://wa.me/85298055609?text=%E4%BD%A0%E5%A5%BD%EF%BC%8C%E6%88%91%E6%83%B3%E6%9F%A5%E8%A9%A2%20Morey-Coffinet%202024%20%E9%85%8D%E9%A1%8D"
          className="inline-block px-6 py-3 rounded-lg font-body font-medium text-sm"
          style={{ background: 'hsl(142,40%,28%)', color: '#fff', textDecoration: 'none' }}>
          WhatsApp 查詢 +852 9805 5609
        </a>
      </div>
    </div>
  );
}

// ── Saint Cosme post ──────────────────────────────────────────────────────────
function SaintCosmePost() {
  const wines = [
    { name: "Cotes du Rhone Rouge 2024", type: "Red", score: "90", critic: "Vinous", price: "HK$120", listPrice: "HK$185", note: "A single-variety Syrah. Intense white pepper, ripe black cherry and wild herbs. Fresh, supple and immediately appealing." },
    { name: "Les Deux Albion Blanc 2024 (Cotes du Rhone)", type: "White", score: null, critic: null, manga: true, price: "HK$155", listPrice: "HK$185", note: "Salty minerality typical of limestone terroir with notes of dried apricots and white flowers. Fresh aromas of white peach, mango and rose, integrated with a balanced, saline palate." },
    { name: "Les Deux Albion Rouge 2022 (Cotes du Rhone)", type: "Red", score: "91", critic: "WS", manga: true, price: "HK$155", listPrice: "HK$195", note: "Juicy and fresh, with notes of plum and blackberry compote supported by violets, black licorice and wood spice. This wine has energy and grit all the way through to the end. The wine that transported manga readers to Bali." },
    { name: "Gigondas 2023", type: "Red", score: "94", critic: "WA", price: "HK$298", listPrice: "HK$420", note: "One of the best ever from this estate. Impressively full-bodied without being heavy, showcasing wonderfully ripe black cherry fruit with asphalt, red raspberries, sweet spice and licorice. Louis Barruol is continually striving to improve." },
    { name: "Gigondas Hominis Fides 2023", type: "Red", score: "100", critic: "RP (2007)", isSV: true, highlight: true, price: "HK$630", listPrice: "HK$750", note: "Historic score: the 2007 vintage received a perfect 100 from Robert Parker — the only Gigondas ever. 2022+: 'Full-bodied, concentrated and layered — aromas of violet, dark cherries, lilac and pepper. Long, mineral and ethereal finish.' Sandy limestone soils fuse power with softness in this profound, enigmatic wine." },
    { name: "Gigondas Le Claux 2023", type: "Red", score: "97", critic: "WA (2018)", isSV: true, price: "HK$630", listPrice: "HK$750", note: "Everything about the all-Grenache Le Claux is big — from the huge black cherry and blackberry fruit, to the insane levels of concentration, the rich, velvety tannins and the never-ending, licorice-tinged finish. Should evolve for at least a decade and a half. Jancis Robinson: 17/20, Super-glam!" },
    { name: "Gigondas Le Poste 2024", type: "Red", score: "99", critic: "WA (2010)", isSV: true, top100: true, price: "HK$630", listPrice: "HK$750", note: "The highest elevation single vineyard at 280m. 2010: 'An amazing tour de force — 45+-second finish.' 2021 named Vinous Top 100 Wines of 2024 #27: 'Masterfully marrying power and complexity — an instant classic and top contender for wine of the year in Gigondas.'" },
    { name: "Gigondas Le Poste Blanc 2024", type: "White", score: null, critic: null, isSV: true, price: "HK$338", listPrice: "HK$395", note: "Made from Clairette planted in the Le Poste vineyard. Famously long-lived with gunflint mineral character and the ability to age 20+ years. 2024: delicate white flowers, pear and white peach, crisp acidity with subtle almond finish." },
    { name: "Saint-Joseph Rouge 2023", type: "Red", score: "95", critic: "WA (2019)", price: "HK$180", listPrice: "HK$300", note: "Blackberries, pepper, violets, and ground herbs — beautiful freshness and minerality. The 2019 scored 95 WA and 93 Vinous. 100% Serine/Syrah from Northern Rhone." },
    { name: "Crozes-Hermitage 2023", type: "Red", score: null, critic: null, price: "HK$238", listPrice: "HK$348", note: "2024 vintage: progress during maturation reminiscent of an athlete approaching the Olympics. Expressiveness unmistakably bears the hallmark of fine wines. — Louis Barruol, Booklet 2026" },
    { name: "Cote-Rotie 2023", type: "Red", score: null, critic: null, price: "HK$438", listPrice: "HK$550", note: "2024 vintage: great finesse, cut from a Burgundian cloth with intense aromatics of red berry fruits, graphite and peony. Elegance and softness prevail. — Louis Barruol, Booklet 2026" },
    { name: "Condrieu 2023", type: "White", score: null, critic: null, isSommPick: true, price: "HK$398", listPrice: "HK$495", note: "2024 vintage: captivating aromas of elderflower and bush peaches. Among the finest Viogniers in a great vintage year. 100% Viognier from Northern Rhone. — Louis Barruol, Booklet 2026" },
  ] as const;

  return (
    <div className="max-w-[680px] mx-auto">

      {/* Estate Story */}
      <div className="mb-10">
        <SectionLabel>酒莊故事 · Histoire du Domaine</SectionLabel>
        <Rule color="hsl(355,65%,35%)" />
        <h2 className="font-display text-3xl font-light text-foreground mb-5">500年風土傳承的 Gigondas 奇蹟</h2>
        <p className="font-body text-base text-muted-foreground leading-relaxed mb-4">
          Chateau de Saint Cosme 坐落於 Gigondas 核心地帶，莊園內保存完好的 Gallo-Roman 石鑿發酵槽是法國現存最古老的釀酒遺址之一。自 <strong>1490 年</strong>起，Barruol 家族在此代代相傳，如今已踏入第 <strong>14 代</strong>。Saint Cosme 教堂建於 11–12 世紀，矗立在葡萄園中央，是 Romanesque 藝術的瑰寶。
        </p>
        <p className="font-body text-base text-muted-foreground leading-relaxed mb-4">
          現任莊主 <strong>Louis Barruol</strong> 於 1992 年接掌酒莊後，率先在 Gigondas 推行單一園裝瓶概念，並於 2010 年完成生物動力法轉型。葡萄園平均樹齡 60 年，產量極少，使用整串葡萄發酵、天然酵母，不下膠、不過濾（no fining, no filtering）。
        </p>
        <Quote text="I like to make wines that show pure, precise sense of place — wines that have personality and balance. I want them to have the propensity to age." source="Louis Barruol, 14th-generation winemaker" />
      </div>

      {/* Terroir — 3 soils */}
      <div className="mb-10 p-6 rounded-xl" style={{background:'hsl(355,65%,10%)'}}>
        <SectionLabel>風土秘密 · Terroir</SectionLabel>
        <div className="w-10 h-[1px] mb-5" style={{background:'hsl(38,72%,52%)'}} />
        <h3 className="font-display text-2xl font-light text-white mb-3">兩條地質斷層交匯的土壤奇觀</h3>
        <p className="font-body text-sm leading-relaxed mb-5" style={{color:'rgba(255,255,255,0.7)'}}>
          Saint Cosme 坐落於兩條地質斷層交匯處，形成多元土壤組合。加上 Dentelles de Montmirail 山脈每天偷去一小時日照，酒莊享有涼爽、晚熟的獨特微氣候，賦予酒款清新度與張力。
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: "'Hominis Fides'", desc: "中新世瑞士沙地，高石灰質。沙質土壤賦予 Grenache 獨特質感，融合力量與柔美。RP 歷史滿分 100 分。" },
            { name: "'Le Claux'", desc: "黏土及石灰質泥灰，表面細碎礫石。藤齡逾百年，最具「勃艮第風格」的 Gigondas。WA 97 分。" },
            { name: "'Le Poste'", desc: "Tortonian 期石灰質泥灰，全 Gigondas 唯一。海拔 280m，最優雅細膩。WA 99 分 / Vinous Top 100 #27。" },
          ].map(s => (
            <div key={s.name} className="p-3 rounded-lg" style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)'}}>
              <div className="font-body text-xs font-semibold mb-1.5 italic" style={{color:'hsl(38,72%,52%)'}}>{s.name}</div>
              <div className="font-body text-[11.5px] leading-relaxed" style={{color:'rgba(255,255,255,0.58)'}}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 神之水滴 */}
      <div className="mb-10 rounded-xl overflow-hidden border border-border">
        <div className="px-5 py-4" style={{background:'hsl(355,65%,14%)'}}>
          <span className="font-body text-[9px] font-semibold tracking-[0.2em] uppercase" style={{color:'hsl(38,72%,52%)'}}>★ 神之水滴 · Drops of God</span>
          <h3 className="font-display text-xl font-light text-white mt-1">改變亞洲葡萄酒市場的那瓶酒</h3>
        </div>
        <div className="p-5 bg-card">
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
            日本殿堂級葡萄酒漫畫《神之水滴》第 3 卷，主角品嚐 Saint Cosme 的 <strong>Les Deux Albion Rouge</strong> 後，彷彿置身峇里島，感受到不同香料、熟果與花卉的奇幻香氣。主角形容：「先是弱弱的、散漫的，但靜置 30 分鐘後，酒魂甦醒……」
          </p>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            「<em>Albion</em>」是大不列顛島的古稱（the historic name for the island of Great Britain）。酒名「Les Deux Albion」代表 Louis Barruol 與英籍妻子的婚姻——兩個 Albion 的結合。這支看似平凡的 Cotes-du-Rhone 一夜之間成為亞洲最受追捧的隱藏瑰寶。
          </p>
        </div>
      </div>

      {/* 2024 Vintage */}
      <div className="mb-10 p-5 rounded-xl" style={{background:'hsl(355,65%,25%)'}}>
        <p className="font-body text-[9px] font-semibold tracking-[0.22em] uppercase text-white/70 mb-2">2024 年份概覽 · Vintage Overview</p>
        <p className="font-body text-sm text-white leading-relaxed">
          「2024 年我們的 Gigondas 和 Vacqueyras 散發出罕見的魔法般果味、深度與優雅柔滑。它們是質感精緻的佳釀，捕捉到溫和年份的完美平衡。<strong>千萬不要錯過 2024 年份。</strong>」— Louis Barruol
        </p>
        <p className="font-body text-[11px] text-white/60 mt-2">大年份：1978 · 1985 · 1990 · 1998 · 2007 · 2010 · 2016 · <strong className="text-white/80">2024</strong></p>
      </div>

      {/* Wine list */}
      <div className="mb-8">
        <SectionLabel>2024 全系列優惠 · Complete Offer</SectionLabel>
        <Rule color="hsl(355,65%,35%)" />
        <p className="font-body text-[11px] text-muted-foreground mb-6">RP / WA = Wine Advocate · WS = Wine Spectator · Vinous = Antonio Galloni · 評分來自歷年最佳紀錄</p>
        <div className="space-y-4">
          {wines.map((w: any) => (
            <div key={w.name} className={`border rounded-xl overflow-hidden ${w.highlight ? 'border-[hsl(355,65%,35%)] ring-1 ring-[hsl(355,65%,35%)]' : w.isSV ? 'border-[hsl(38,60%,60%)]' : 'border-border'}`}>
              {w.highlight && (
                <div className="text-[10px] font-semibold tracking-widest uppercase text-center py-1.5 border-b" style={{background:'hsl(355,65%,14%)', color:'hsl(38,72%,60%)', borderColor:'hsl(355,65%,25%)'}}>
                  RP 100 · Gigondas 史上唯一滿分
                </div>
              )}
              {w.top100 && (
                <div className="text-[10px] font-semibold tracking-widest uppercase text-center py-1.5 border-b bg-amber-50 text-amber-800 border-amber-200">
                  Vinous Top 100 Wines of 2024 · #27
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h4 className="font-display text-[16px] font-medium leading-snug text-foreground mb-2">{w.name}</h4>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className={`text-[9.5px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded ${w.type === 'White' ? 'bg-sky-50 text-sky-700' : 'bg-red-50 text-red-700'}`}>
                        {w.type === 'White' ? 'White 白酒' : 'Red 紅酒'}
                      </span>
                      {w.isSV && <span className="text-[9.5px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700">★ Single Vineyard</span>}
                      {w.manga && <span className="text-[9.5px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded" style={{background:'#EEE8F5', color:'#4A2A8B'}}>★ 神之水滴</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    {w.score ? (
                      <div className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center ${w.highlight ? 'border-[hsl(355,65%,35%)] bg-[hsl(355,65%,14%)]' : 'border-[hsl(38,60%,50%)] bg-amber-50/60'}`}>
                        <span className={`font-display font-bold leading-none text-xl ${w.highlight ? 'text-white' : 'text-[hsl(355,65%,30%)]'}`}>{w.score}</span>
                        <span className="text-[7px] font-semibold text-muted-foreground uppercase tracking-wide mt-0.5">{w.critic?.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full border-2 border-border flex flex-col items-center justify-center bg-muted/20">
                        <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wide">—</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-l-[3px] px-3 py-2.5 mb-4 rounded-r" style={{borderColor:'rgba(122,28,38,0.3)', background:'rgba(122,28,38,0.04)'}}>
                  <p className="font-body text-[12.5px] italic text-muted-foreground leading-relaxed">{w.note}</p>
                  {w.critic && <span className="text-[10px] text-muted-foreground/70 mt-1 block not-italic">— {w.critic}</span>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Terroir & Craft 獨家供應</div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground line-through mr-2">{w.listPrice}</span>
                    <span className="font-display text-xl font-medium" style={{color:'hsl(355,65%,30%)'}}>{w.price}</span>
                    <span className="text-xs text-muted-foreground ml-1">/bottle</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 rounded-xl text-center" style={{background:'hsl(355,65%,10%)'}}>
        <p className="font-body text-sm text-white/75 mb-4">2024 Vintage 獨家夏季優惠，限時至 2026 年 8 月 31 日。</p>
        <a href="/promotions/saintcosme2024"
          className="inline-block px-6 py-3 rounded-lg font-body font-medium text-sm"
          style={{ background: 'hsl(38,72%,52%)', color: '#fff', textDecoration: 'none' }}>
          查看全部優惠酒款 →
        </a>
      </div>
    </div>
  );
}

// ── Blog post registry ────────────────────────────────────────────────────────
export const BLOG_POSTS: BlogPost[] = [
  {
    id: "saint-cosme-2024",
    slug: "chateau-saint-cosme-2024-vintage",
    title: "Chateau de Saint Cosme 2024 — RP 100pts, Drops of God & Full Offer",
    titleZh: "Saint Cosme 2024 · RP 100分 · 神之水滴 · 全系列優惠",
    date: "2026-07-28",
    category: "Producer Feature",
    categoryZh: "酒莊推介",
    heroImage: "https://winebow-files.s3.amazonaws.com/public/2025-08/spring044.jpg?VersionId=Fd93hocLV5X9r8OfwKlp2mBxjS94V9gX",
    excerpt: "Hominis Fides 2007 scored a perfect 100 from Robert Parker — the only Gigondas ever. Plus the Drops of God connection and exclusive summer pricing.",
    excerptZh: "Hominis Fides 2007 獲 Robert Parker 滿分 100 分，Gigondas 史上唯一。神之水滴第 3 卷主角酒款，加上天地人酒業獨家夏季優惠，限時至 8 月 31 日。",
    component: SaintCosmePost,
  },
  {
    id: "morey-coffinet-2024",
    slug: "morey-coffinet-2024-vintage",
    title: "Domaine Morey-Coffinet 2024 Vintage — Burghound Review & Full Offer",
    titleZh: "Morey-Coffinet 2024 年份 · Burghound 評分 + 全系列推介",
    date: "2026-07-24",
    category: "Producer Feature",
    categoryZh: "酒莊推介",
    heroImage: "https://www.chassagne-montrachet.com/wp-content/uploads/2020/01/071-MOREY-COFFINET.jpg",
    excerpt: "Allen Meadows (Burghound) calls the 2024 Batard-Montrachet a 95-point masterpiece. Full tasting notes + exclusive HK pricing inside.",
    excerptZh: "Burghound (Allen Meadows) 給予 2024 Batard-Montrachet 95 分，形容「If you can find, don't hesitate」。全系列 Burghound 評分 + 天地人酒業獨家優惠價。",
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
      <div className="border-b border-border bg-[hsl(30,20%,98%)] dark:bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center">
          <p className="font-body text-xs font-medium tracking-[0.2em] uppercase text-[hsl(40,60%,45%)] mb-3">Terroir &amp; Craft · 天地人酒業</p>
          <h1 className="font-display text-4xl sm:text-5xl font-light text-foreground mb-3">Wine Blog <span className="text-muted-foreground text-3xl">· 酒識</span></h1>
          <p className="font-body text-muted-foreground text-sm max-w-lg mx-auto">Producer features, vintage reports, tasting notes and buying guides from our team of specialists.</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {BLOG_POSTS.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <div className="group block rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all duration-200 cursor-pointer">
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={post.heroImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
