export interface Rating {
  source: string;       // e.g. "James Halliday", "Wine Advocate", "Wine Spectator"
  score: number;        // e.g. 99
  maxScore: number;     // e.g. 100
  note?: string;        // short quote from the review
  year?: string;        // vintage reviewed
}

export interface MediaLink {
  type: "instagram" | "facebook" | "threads" | "youtube" | "article";
  url: string;
  label: string;        // display text
  thumbnail?: string;   // optional thumbnail URL
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  country: string;
  region: string;
  type: string;
  status: string;
  size: string;
  vintage: string;
  price: number;
  promo_price?: number;        // promotional / sale price (optional)
  price_display: string;
  description?: string;
  tasting_notes?: string;        // legacy field
  tasting_note?: string;         // new field from Excel
  food_pairing?: string;
  image_url?: string;
  // Rich product detail fields
  grape?: string;                // e.g. "Shiraz" (from Excel)
  grape_varietals?: string[];    // legacy array form
  phonetic?: string;             // pronunciation guide for French names
  style?: string;
  alcohol?: string;
  serve_temp?: string;
  cellaring?: string;
  winemaker_notes?: string;
  ratings?: Rating[];
  media_links?: MediaLink[];
  exclusive?: boolean;           // true = exclusive agency brand
}

export const WINE_TYPE_COLORS: Record<string, string> = {
  "Red": "badge-red",
  "White": "badge-white",
  "Sparkling": "badge-sparkling",
  "Sparkling Red": "badge-sparkling",
  "Champagne": "badge-champagne",
  "Rose": "badge-rose",
  "Fortified": "badge-fortified",
  "Makgeolli": "badge-magoli",
};

export const BRAND_INFO: Record<string, { country: string; description: string; website?: string }> = {
  "Mollydooker": {
    country: "Australia · McLaren Vale, South Australia",
    description: "Mollydooker — Australian slang for \'left-hander\' — is one of Australia\'s most celebrated cult wine producers, founded by the husband-and-wife team Sparky and Sarah Marquis in McLaren Vale. Known for their bold, fruit-forward reds that routinely score 95+ points, Mollydooker has built a devoted global following for wines that deliver extraordinary richness, concentration and pure Australian character. Their signature Mollydooker Shake technique — vigorously shaking the bottle before opening — unlocks the wine\'s full fruit expression, and has become a beloved ritual among fans worldwide. From the accessible Boxer Shiraz to the legendary Velvet Glove, every Mollydooker wine is a celebration of life, fun, and the extraordinary terroir of McLaren Vale.\n\nMollydooker（澳洲俚語「左撇子」）由夫妻檔 Sparky 與 Sarah Marquis 在南澳麥克拉倫谷創立，是澳洲最受追捧的邪教酒莊之一。以大膽奔放、果味十足的紅酒著稱，分數常達 95+ 分，深受全球愛酒人士追捧。招牌的「Mollydooker Shake」搖瓶技巧——開瓶前用力搖晃 30-60 秒——讓葡萄酒的果味全面爆發，已成為粉絲間深入人心的儀式。從入門款 Boxer Shiraz 到傳奇 Velvet Glove，每一款 Mollydooker 都是對麥克拉倫谷風土與生活熱情的禮讚。",
    website: "https://mollydookerwines.com",
  },
  "Château de Saint Cosme": {
    country: "France · Gigondas, Rhône Valley",
    description: "Established in 1490, Château de Saint Cosme is the most celebrated estate in Gigondas and one of the Rhône Valley's oldest family domaines. Winemaker Louis Barruol, the 15th generation at the helm, combines deep respect for tradition with a visionary approach to terroir expression. The estate's ancient vines and limestone soils produce wines of remarkable depth, elegance, and minerality — benchmark examples that define the essence of Gigondas.\n\n創立於1490年的聖寇斯姆酒莊（Château de Saint Cosme），是吉攻達斯（Gigondas）最具代表性、亦是當地最傑出的酒莊。第十五代莊主兼釀酒師 Louis Barruol，以對風土的深刻理解與精細釀造手法，呈現出酒莊百年傳統的靈魂。莊園古老葡萄藤和石灰岩土壤孕育出層次豐富、優雅且礦物感鮮明的佳釀，成為南隆河產區品質與真誠的象徵。",
    website: "https://saintcosme.com",
  },
  "Morey-Coffinet": {
    country: "France · Chassagne-Montrachet, Côte de Beaune",
    description: "Domaine Morey-Coffinet stands out as one of the most exciting domaines in Chassagne-Montrachet, uniting the historic Morey and Coffinet families at the heart of Burgundy's \"golden triangle.\" Founded around 1980 by Michel Morey and his wife Fabienne Coffinet, the estate brings together some of the village's finest parcels, including prestigious sites in Chassagne-Montrachet, Puligny-Montrachet and Grand Cru Bâtard-Montrachet. Today, winemaker Thibault Morey, the new generation at the helm, is renowned for crafting white Burgundies of precision, elegance and mineral-driven tension that perfectly express their limestone-rich terroirs. Under his leadership, the domaine has embraced organic and biodynamic viticulture, focusing on low yields, meticulous vineyard work and sensitive élevage to highlight purity, energy and finesse in every cuvée.\n\nDomaine Morey-Coffinet 位於布根地金丘核心地帶的 Chassagne-Montrachet，由當地兩大傳奇家族 Morey 與 Coffinet 聯婚而成，是區內最具潛力和備受關注的頂尖酒莊之一。現任釀酒師 Thibault Morey 承接家族衣鉢，以細致優雅、礦物感鮮明和張力十足的白酒見稱，被視為新一代 Chassagne-Montrachet 代表人物之一。酒莊已全面採用有機及生物動力法種植，嚴控產量並以溫和陳釀手法，將風土個性精準呈現於每一瓶佳釀之中。",
    website: "https://www.morey-coffinet.com",
  },
  "Maison Morey-Coffinet": {
    country: "France",
    description: "The négociant arm of the renowned Morey Coffinet domaine, extending their Burgundian expertise to a wider range of acclaimed appellations.",
  },
  "Kopke": {
    country: "Portugal · Douro Valley & Vila Nova de Gaia",
    description: "Kopke holds the extraordinary distinction of being the world\'s oldest Port wine house, with roots stretching back to 1638 when Christiano Kopke first established trade between Germany and Portugal. Over nearly four centuries, Kopke has built an unrivalled legacy of Tawny Ports, rare Colheitas and White Ports that stand as benchmarks of the Douro Valley\'s finest terroir. Their aged Tawnies — matured in century-old oak lodges in Vila Nova de Gaia — develop extraordinary complexity: notes of dried fruit, walnut, toffee and spice that can only come from decades of patient ageing. For collectors and connoisseurs, Kopke\'s vintage-dated Colheitas represent some of the most historically significant and emotionally evocative wines in the world.\n\nKopke 是全球歷史最悠久的波特酒莊，創立於 1638 年，當年由德國商人 Christiano Kopke 在葡萄牙開創波特酒貿易。近四個世紀以來，酒莊以其卓越的 Tawny Port、珍稀年份 Colheita 及白波特酒奠定了杜羅河谷的標誌地位。在維拉·諾瓦·德蓋亞的百年老橡木桶中緩慢陳年，展現出乾果、核桃、太妃糖與香料的複雜層次——那是唯有時間方能賦予的深度。對於收藏家和品鑒家而言，Kopke 的年份 Colheita 是世界上最具歷史意義、最扣人心弦的佳釀之一。",
    website: "https://kopke1638.com",
  },
  "Realm Cellars": {
    country: "USA · Napa Valley, California",
    description: "Realm Cellars is one of Napa Valley's most sought-after cult producers, founded in 2003 with a singular vision: to craft wines that reflect the extraordinary diversity of Napa's greatest vineyards. Working with iconic sites including Beckstoffer To Kalon and Farella Vineyard, Realm produces Cabernet Sauvignon of breathtaking precision and complexity. Demand consistently exceeds supply, and their wines are considered among the most coveted in California.\n\nRealm Cellars 是納帕谷最炙手可熱的精品酒莊之一，創立於 2003 年，專注呈現納帕頂級葡萄園的卓越多樣性。與 Beckstoffer To Kalon、Farella 等傳奇葡萄園建立長期合作，釀造出精準度與複雜度令人窒息的赤霞珠。需求遠超供應，被視為加州最珍貴的收藏之一。",
    website: "https://www.realmcellars.com",
  },
  "Vereinigte Hospitien": {
    country: "Germany · Mosel & Saar",
    description: "Vereinigte Hospitien is Germany's oldest wine estate, with records of viticulture dating back to 1286 and ancient Roman wine cellars beneath the town of Trier. Founded through the merger of several historic charitable foundations, their wines — primarily from the great Mosel and Saar vineyards including Scharzhofberger and Ayler Kupp — are among the most historically significant Rieslings in the world. The tradition of stewardship, precision and Prädikat excellence continues in every bottle.\n\nVereinigte Hospitien 是德國歷史最悠久的葡萄酒莊，葡萄種植記錄可追溯至 1286 年，地下更保存有古羅馬時代的酒窖。其出品——主要來自摩澤爾與薩爾河的頂級葡萄園，包括 Scharzhofberger 及 Ayler Kupp——被視為全球最具歷史意義的麗絲玲之一。數百年傳承、精準與 Prädikat 優質標準始終是每一瓶佳釀的核心。",
    website: "https://weingut.vereinigtehospitien.de/en",
  },
  "Tscharke": {
    country: "Australia · Barossa Valley",
    description: "Tscharke is a sixth-generation family estate in the Barossa Valley, farming heritage Grenache, Shiraz and Mataro vines that date back to the 1840s. Winemaker Damien Tscharke is a passionate advocate for organic and biodynamic farming, working the ancient soils by hand to produce wines of extraordinary concentration, depth and authenticity. The estate's old-vine Grenache in particular has drawn international acclaim as a benchmark example of Barossa terroir at its finest.\n\nTscharke 是巴羅薩谷的第六代家族酒莊，擁有可追溯至 1840 年代的古老 Grenache、Shiraz 及 Mataro 葡萄藤。釀酒師 Damien Tscharke 以有機及生物動力法耕作古老土壤，釀造出濃郁、深邃且充滿個性的佳釀。酒莊的老藤 Grenache 尤其享譽國際，被視為巴羅薩風土的標誌性詮釋。",
    website: "https://tscharke.com.au",
  },
  "Sherwood": {
    country: "New Zealand · Waipara Valley",
    description: "Sherwood Estate is one of Waipara Valley's pioneering wineries, crafting elegant cool-climate wines since 1987. Nestled in the foothills of North Canterbury, the estate's free-draining limestone soils and long sunny days with cool nights create ideal conditions for Pinot Noir and Riesling of remarkable purity and finesse. Winemaker Dayne Sherwood applies minimal intervention techniques to let the vineyard's natural character speak clearly in every bottle.\n\nSherwood Estate 是新西蘭 Waipara Valley 的先驅酒莊之一，自 1987 年起致力釀造優雅的涼爽氣候葡萄酒。排水良好的石灰岩土壤配合漫長晴朗的白天與清涼夜晚，為黑皮諾和麗絲玲提供理想環境，展現出純淨而精緻的風土個性。",
    website: "https://www.sherwood.co.nz",
  },
  "Champagne Boizel": {
    country: "France · Épernay, Champagne",
    description: "Champagne Boizel is one of the great Grandes Marques of Épernay, founded in 1834 by Julie Boizel — a pioneering woman in the male-dominated Champagne trade. Now in the sixth generation of family ownership, Boizel crafts Champagnes of extraordinary refinement and consistency, blending wines from over 250 growers across the finest Champagne crus. Their signature style — fresh, precise, and elegantly aged — has earned loyal followings from connoisseurs worldwide.\n\nChampagne Boizel 是香檳區最具聲望的頂級酒莊之一，由 Julie Boizel 於 1834 年創立，是香檳貿易史上罕見的女性先驅。時至今日，酒莊已傳承至第六代家族成員，以超過 250 個葡萄園的佳釀精心調配，呈現出清新、精準、優雅陳年的標誌性風格，深受全球品鑒家珍視。",
    website: "https://www.boizel.com",
  },
  "Crystallum": {
    country: "South Africa",
    description: "A benchmark South African producer from the Hemel-en-Aarde Valley, making world-class Chardonnay that rivals the finest Burgundy.",
  },
  "Levrier Wines by Jo Irvine": {
    country: "Australia · Barossa Valley",
    description: "Levrier Wines is the passion project of renowned Barossa winemaker Jo Irvine, dedicated to rescuing and celebrating the Barossa's forgotten grape varietals — Dolcetto, Lagrein, Tempranillo and more — rarely found anywhere else in Australia. Jo's philosophy: let the ancient Barossa soils speak with minimal intervention and deep respect for old-vine heritage. The Levrier label (named after the elegant greyhound) reflects wines of remarkable depth, complexity and personality.\n\nLevrier Wines 是巴羅薩名釀酒師 Jo Irvine 的心血之作，致力於拯救並頌揚巴羅薩被遺忘的稀有品種——Dolcetto、Lagrein、Tempranillo 等。Jo 的釀酒哲學：讓巴羅薩古老土壤自由表達，以最低干預尊重老藤遺產。Levrier（以優雅靈緹犬命名）的每一款酒都展現出深邃、複雜且充滿個性的風格。",
    website: "https://levrierwines.com.au",
  },
  "Pasqua": {
    country: "Italy · Verona, Veneto",
    description: "Pasqua Vigneti e Cantine was founded in 1925 by three brothers in Verona and has grown into one of Italy's most innovative wine families. Under the bold philosophy of 'House of the Unconventional,' Pasqua pushes boundaries with experimental projects — including the iconic '11 Minutes' Rosé, named for the precise time the grape skins spend in contact with the juice. From Appassimento-style reds to vibrant Soave whites, every Pasqua wine challenges expectations.\n\nPasqua 由三兄弟於 1925 年在意大利維羅納創立，歷經百年發展成為意大利最具創新精神的釀酒家族之一。秉持「非傳統之家」哲學，包括標誌性的「11 Minutes」玫瑰紅酒——以葡萄皮與果汁接觸的精確時間命名。從 Appassimento 紅酒到清新 Soave 白酒，每款佳釀都挑戰固有期待。",
    website: "https://www.pasqua.it/en",
  },
  "Canmak": {
    country: "South Korea",
    description: "Canmak brings the ancient Korean tradition of Makgeolli into the modern era with a fresh, approachable style. Made from fermented rice with a naturally low 5% alcohol, Canmak's lightly sparkling, milky-white brew offers a delicate balance of gentle sweetness and soft acidity — refreshing, sessionable, and endlessly food-friendly. Available in Original, Peach, Green Grape and Mango, Canmak is the perfect gateway to Korea's rich fermented beverage culture.\n\nCanmak 將古老的韓國막걸리（濁酒）傳統以現代方式重新演繹，廣受好評。以天然發酵米釀造，酒精濃度僅 5%，輕微起泡的乳白色酒液帶來甜酸平衡的清新口感，清爽易飲且極具配餐百搭性。現有 Original、桃子、青提及芒果四款口味，是探索韓國豐富發酵飲品文化的最佳入門之選。",
    website: "https://canmakofficial.com",
  },
  "Hydrodol": {
    country: "Australia",
    description: "Hydrodol is Australia's leading hangover supplement, developed in 2006 by Australian researchers to support rehydration, recovery and mental clarity after drinking. Each sachet delivers a precisely formulated blend of electrolytes, B vitamins, milk thistle and antioxidants — taken before or after drinking to help your body process alcohol more efficiently. Trusted by over one million Australians every year, Hydrodol is the smart companion for anyone who loves good wine but values feeling great the next morning.\n\nHydrodol 是澳洲最受信賴的宿醉恢復補充品，由澳洲研究團隊於 2006 年研發，專為支援飲酒後的補水、恢復及精神清晰度而設計。精心配製的配方含有電解質、維他命 B 群、奶薊草及抗氧化劑——於飲酒前後服用，幫助身體更有效代謝酒精。每年逾百萬澳洲人選用 Hydrodol，是熱愛美酒又重視第二天感覺的最佳伴侶。",
    website: "https://hydrodol.com.au",
  },
};

export function getTypeBadgeClass(type: string): string {
  return WINE_TYPE_COLORS[type] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

export function formatPrice(price: number): string {
  return `HK$${price.toLocaleString()}`;
}
