import type { Product, ChatMessage, InsertChatMessage, Member, InsertMember, PointsLogEntry } from "@shared/schema";
import { members, pointsLog, resetTokens } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import productsData from "./products.json";

// ── Raw product type ──────────────────────────────────────────────────────────
interface RawProduct {
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
  promo_price?: number;
  price_display: string;
  image_url?: string;
  grape?: string;
  tasting_note?: string;
  ratings?: Array<{ source: string; score: number; maxScore: number; note?: string; year?: string }>;
  exclusive?: boolean;
}

const tastingNotesByType: Record<string, string> = {
  "Red": "Rich fruit character, structured tannins, elegant finish",
  "White": "Crisp acidity, fresh citrus and stone fruit, mineral driven",
  "Sparkling": "Fine persistent bubbles, creamy texture, toasty brioche notes",
  "Sparkling Red": "Vibrant berry fruit, gentle fizz, refreshing and fun",
  "Champagne": "Complex autolytic notes, fine mousse, toasted brioche and citrus",
  "Fortified": "Rich dried fruit, caramel, nutty complexity, lingering sweetness",
  "Rose": "Fresh red berries, delicate floral notes, dry and refreshing",
  "Makgeolli": "Traditional rice brew, light and slightly effervescent, subtly sweet",
};

const foodPairingByType: Record<string, string> = {
  "Red": "Grilled meats, aged cheeses, lamb, beef stew",
  "White": "Seafood, sushi, light pasta, white meats, salads",
  "Sparkling": "Oysters, canapés, light starters, celebrations",
  "Sparkling Red": "Charcuterie, pizza, BBQ, casual gatherings",
  "Champagne": "Caviar, oysters, lobster, fine dining",
  "Fortified": "Blue cheese, dark chocolate, dried fruits, nuts, desserts",
  "Rose": "Grilled fish, summer salads, charcuterie, soft cheeses",
  "Makgeolli": "Korean BBQ, spicy food, dim sum, light snacks",
};

const enrichedProducts: Product[] = (productsData as RawProduct[]).map(p => ({
  ...p,
  description: `${p.brand} ${p.name.replace(p.brand + ' - ', '')} from ${p.region || p.country}. ${p.vintage && p.vintage !== 'NV' ? 'Vintage ' + p.vintage + '.' : p.vintage === 'NV' ? 'Non-vintage.' : ''} ${p.size} bottle.`,
  tasting_notes: tastingNotesByType[p.type] || "Complex and refined character",
  food_pairing: foodPairingByType[p.type] || "Versatile food pairing",
  image_url: p.image_url || "",
}));

// ── In-memory chat store ──────────────────────────────────────────────────────
const chatStore: Map<string, ChatMessage[]> = new Map();
let chatIdCounter = 1;

// ── Tier calculation ──────────────────────────────────────────────────────────
function calcTier(points: number): string {
  if (points >= 3000) return "Platinum";
  if (points >= 1000) return "Gold";
  return "Silver";
}

// ── Storage interface ─────────────────────────────────────────────────────────
export interface IStorage {
  // Products (in-memory, read-only)
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  searchProducts(query: string, filters: { type?: string; country?: string; minPrice?: number; maxPrice?: number }): Promise<Product[]>;
  getProductsByBrand(brand: string): Promise<Product[]>;

  // Chat (in-memory)
  getChatHistory(sessionId: string): Promise<ChatMessage[]>;
  addChatMessage(msg: InsertChatMessage): Promise<ChatMessage>;
  clearChatHistory(sessionId: string): Promise<void>;

  // Members (PostgreSQL)
  createMember(data: InsertMember): Promise<Member>;
  getMemberByEmail(email: string): Promise<Member | undefined>;
  getMemberById(id: number): Promise<Member | undefined>;
  updateMember(id: number, patch: Partial<Member>): Promise<Member>;

  // Points (PostgreSQL)
  addPoints(memberId: number, delta: number, reason: string): Promise<Member>;
  getPointsLog(memberId: number): Promise<PointsLogEntry[]>;
}

export const storage: IStorage = {
  // ── Products ──────────────────────────────────────────────────────────────
  async getAllProducts() { return enrichedProducts; },
  async getProductById(id) { return enrichedProducts.find(p => p.id === id); },
  async searchProducts(query, filters) {
    let results = enrichedProducts;
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      );
    }
    if (filters.type) results = results.filter(p => p.type.toLowerCase() === filters.type!.toLowerCase());
    if (filters.country) results = results.filter(p => p.country.toLowerCase() === filters.country!.toLowerCase());
    if (filters.minPrice !== undefined) results = results.filter(p => p.price >= filters.minPrice!);
    if (filters.maxPrice !== undefined) results = results.filter(p => p.price <= filters.maxPrice!);
    return results;
  },
  async getProductsByBrand(brand) {
    return enrichedProducts.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  },

  // ── Chat ──────────────────────────────────────────────────────────────────
  async getChatHistory(sessionId) { return chatStore.get(sessionId) || []; },
  async addChatMessage(msg) {
    const message: ChatMessage = { ...msg, id: chatIdCounter++ };
    const history = chatStore.get(msg.session_id) || [];
    history.push(message);
    chatStore.set(msg.session_id, history);
    return message;
  },
  async clearChatHistory(sessionId) { chatStore.delete(sessionId); },

  // ── Members (PostgreSQL) ──────────────────────────────────────────────────
  async createMember(data: InsertMember): Promise<Member> {
    const now = new Date().toISOString();
    const [member] = await db.insert(members).values({
      ...data,
      points: 50, // welcome bonus
      tier: "Silver",
      bonus_newsletter: false,
      bonus_ig: false,
      bonus_facebook: false,
      bonus_first_order: false,
      created_at: now,
    }).returning();

    // Log welcome bonus
    await db.insert(pointsLog).values({
      member_id: member.id,
      delta: 50,
      reason: "Welcome bonus — account registration",
      created_at: now,
    });

    return member;
  },

  async getMemberByEmail(email: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.email, email.toLowerCase()));
    return member;
  },

  async getMemberById(id: number): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member;
  },

  async updateMember(id: number, patch: Partial<Member>): Promise<Member> {
    const [updated] = await db.update(members).set(patch).where(eq(members.id, id)).returning();
    if (!updated) throw new Error(`Member ${id} not found`);
    return updated;
  },

  // ── Points (PostgreSQL) ───────────────────────────────────────────────────
  async addPoints(memberId: number, delta: number, reason: string): Promise<Member> {
    const member = await this.getMemberById(memberId);
    if (!member) throw new Error(`Member ${memberId} not found`);
    const newPoints = Math.max(0, member.points + delta);
    const newTier = calcTier(newPoints);

    const [updated] = await db.update(members)
      .set({ points: newPoints, tier: newTier })
      .where(eq(members.id, memberId))
      .returning();

    await db.insert(pointsLog).values({
      member_id: memberId,
      delta,
      reason,
      created_at: new Date().toISOString(),
    });

    return updated;
  },

  async getPointsLog(memberId: number): Promise<PointsLogEntry[]> {
    return db.select().from(pointsLog)
      .where(eq(pointsLog.member_id, memberId))
      .orderBy(desc(pointsLog.id));
  },
};

// ── Reset Token helpers (PostgreSQL) ─────────────────────────────────────────
export async function storeResetToken(memberId: number, token: string): Promise<void> {
  // Delete any existing tokens for this member first
  await db.delete(resetTokens).where(eq(resetTokens.member_id, memberId));
  await db.insert(resetTokens).values({
    token,
    member_id: memberId,
    expires_at: Date.now() + 60 * 60 * 1000, // 1 hour
  });
}

export async function consumeResetToken(token: string): Promise<number | null> {
  const [entry] = await db.select().from(resetTokens).where(eq(resetTokens.token, token));
  if (!entry) return null;
  if (Date.now() > entry.expires_at) {
    await db.delete(resetTokens).where(eq(resetTokens.token, token));
    return null;
  }
  await db.delete(resetTokens).where(eq(resetTokens.token, token));
  return entry.member_id;
}
