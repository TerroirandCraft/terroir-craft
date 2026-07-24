// ── URL slug utilities ────────────────────────────────────────────────────────
// Converts product IDs and names to SEO-friendly URL slugs.
// e.g. "TCAU-MO0123" → looks up slug map, or falls back to kebab-case name.

/** Generate a clean URL slug from arbitrary text */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[ý]/g, 'y')
    .replace(/[œ]/g, 'oe')
    .replace(/[æ]/g, 'ae')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Build a descriptive slug for a product */
export function productSlug(product: { id: string; name: string; vintage?: string; grape?: string }): string {
  // Name already contains brand e.g. "Mollydooker - Carnival of Love"
  const base = product.name.replace(/\s*-\s*/, '-');
  let slug = toSlug(base);
  if (product.vintage && product.vintage !== 'NV' && !slug.includes(product.vintage)) {
    slug = `${slug}-${product.vintage}`;
  }
  return slug;
}

/** Build a brand slug */
export function brandSlug(brand: string): string {
  return toSlug(brand);
}

/** Build page title for a product */
export function productTitle(p: {
  brand: string; name: string; vintage?: string;
  grape?: string; region?: string; ratings?: { source: string; score: number }[];
}): string {
  // Strip brand prefix from name if already there
  const wineName = p.name.includes(' - ')
    ? p.name.split(' - ').slice(1).join(' - ')
    : p.name;
  const vintage = p.vintage && p.vintage !== 'NV' ? ` ${p.vintage}` : p.vintage === 'NV' ? ' NV' : '';
  const varietal = p.grape ? ` — ${p.grape}` : '';
  const region = p.region ? `, ${p.region}` : '';
  const topRating = p.ratings?.[0];
  const ratingPrefix = topRating ? `(${topRating.source}${topRating.score}) ` : '';
  return `${ratingPrefix}${p.brand} ${wineName}${vintage}${varietal}${region} | Terroir & Craft HK`;
}

/** Build meta description for a product */
export function productMetaDesc(p: {
  brand: string; name: string; vintage?: string;
  grape?: string; region?: string; country?: string;
  ratings?: { source: string; score: number }[];
  price?: number;
}): string {
  const wineName = p.name.includes(' - ')
    ? p.name.split(' - ').slice(1).join(' - ')
    : p.name;
  const vintage = p.vintage ? ` ${p.vintage}` : '';
  const region = p.region || p.country || '';
  const varietal = p.grape || '';
  const score = p.ratings?.[0] ? `, ${p.ratings[0].score}pts ${p.ratings[0].source}` : '';
  const price = p.price ? `. HK$${p.price}` : '';
  return `Buy ${p.brand} ${wineName}${vintage} in Hong Kong. ${region}${varietal ? ' ' + varietal : ''}${score}. Exclusive HK agency${price}. Free delivery over HK$1,000. Terroir & Craft 天地人酒業.`.slice(0, 160);
}

/** Build page title for a brand page */
export function brandTitle(brand: string): string {
  return `${brand} Wines — Exclusive HK Agency | Terroir & Craft`;
}

/** Build page title for occasion pages */
export function occasionTitle(occasion: string): string {
  const labels: Record<string, string> = {
    gifts: 'Wine Gifts Hong Kong 送禮之選',
    easyreds: 'Easy Drinking Red Wine HK',
    staffpicks: 'Staff Picks — Curated Wine Selection HK',
    bbq: 'BBQ Wine Pairing HK 燒烤配酒',
    hotpot: 'Hotpot Wine Pairing HK 打邊爐配酒',
    new_arrivals: 'New Arrivals — Latest Wines HK',
    champagne: 'Champagne Hong Kong — Buy Online',
  };
  return `${labels[occasion] || occasion} — Curated Selection | Terroir & Craft`;
}
