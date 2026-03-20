import type { Product, ChatMessage, InsertChatMessage, Member, InsertMember, PointsLogEntry } from "@shared/schema";
import productsData from "./products.json";

// Type for raw product JSON
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

// Tasting note additions per product type
const tastingNotesByType: Record<string, string> = {
  "Red": "Rich fruit character, structured tannins, elegant finish",
  "White": "Crisp acidity, fresh citrus and stone fruit, mineral driven",
  "Sparkling": "Fine persistent bubbles, creamy texture, toasty brioche notes",
  "Sparkling Red": "Vibrant berry fruit, gentle fizz, refreshing and fun",
  "Champagne": "Complex autolytic notes, fine mousse, toasted brioche and citrus",
  "Fortified": "Rich dried fruit, caramel, nutty complexity, lingering sweetness",
  "Rose": "Fresh red berries, delicate floral notes, dry and refreshing",
  "Magoli": "Traditional rice brew, light and slightly effervescent, subtly sweet",
};

const foodPairingByType: Record<string, string> = {
  "Red": "Grilled meats, aged cheeses, lamb, beef stew",
  "White": "Seafood, sushi, light pasta, white meats, salads",
  "Sparkling": "Oysters, canapés, light starters, celebrations",
  "Sparkling Red": "Charcuterie, pizza, BBQ, casual gatherings",
  "Champagne": "Caviar, oysters, lobster, fine dining",
  "Fortified": "Blue cheese, dark chocolate, dried fruits, nuts, desserts",
  "Rose": "Grilled fish, summer salads, charcuterie, soft cheeses",
  "Magoli": "Korean BBQ, spicy food, dim sum, light snacks",
};

// Enrich products with descriptions
const enrichedProducts: Product[] = (productsData as RawProduct[]).map(p => ({
  ...p,
  description: `${p.brand} ${p.name.replace(p.brand + ' - ', '')} from ${p.region || p.country}. ${p.vintage && p.vintage !== 'NV' ? 'Vintage ' + p.vintage + '.' : p.vintage === 'NV' ? 'Non-vintage.' : ''} ${p.size} bottle.`,
  tasting_notes: tastingNotesByType[p.type] || "Complex and refined character",
  food_pairing: foodPairingByType[p.type] || "Versatile food pairing",
  image_url: p.image_url || "",
}));

// In-memory chat store
const chatStore: Map<string, ChatMessage[]> = new Map();
let chatIdCounter = 1;

// In-memory member store
const memberStore: Map<number, Member> = new Map();
const memberEmailIndex: Map<string, number> = new Map();
let memberIdCounter = 1;

// In-memory points log
const pointsLogStore: PointsLogEntry[] = [];
let pointsLogIdCounter = 1;

// Tier calculation
function calcTier(points: number): string {
  if (points >= 3000) return "Platinum";
  if (points >= 1000) return "Gold";
  return "Silver";
}

export interface IStorage {
  // Products
  getAllProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  searchProducts(query: string, filters: { type?: string; country?: string; minPrice?: number; maxPrice?: number }): Promise<Product[]>;
  getProductsByBrand(brand: string): Promise<Product[]>;
  
  // Chat
  getChatHistory(sessionId: string): Promise<ChatMessage[]>;
  addChatMessage(msg: InsertChatMessage): Promise<ChatMessage>;
  clearChatHistory(sessionId: string): Promise<void>;

  // Members
  createMember(data: InsertMember): Promise<Member>;
  getMemberByEmail(email: string): Promise<Member | undefined>;
  getMemberById(id: number): Promise<Member | undefined>;
  updateMember(id: number, patch: Partial<Member>): Promise<Member>;

  // Points
  addPoints(memberId: number, delta: number, reason: string): Promise<Member>;
  getPointsLog(memberId: number): Promise<PointsLogEntry[]>;
}

export const storage: IStorage = {
  async getAllProducts(): Promise<Product[]> {
    return enrichedProducts;
  },

  async getProductById(id: string): Promise<Product | undefined> {
    return enrichedProducts.find(p => p.id === id);
  },

  async searchProducts(query: string, filters: { type?: string; country?: string; minPrice?: number; maxPrice?: number }): Promise<Product[]> {
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
    
    if (filters.type) {
      results = results.filter(p => p.type.toLowerCase() === filters.type!.toLowerCase());
    }
    if (filters.country) {
      results = results.filter(p => p.country.toLowerCase() === filters.country!.toLowerCase());
    }
    if (filters.minPrice !== undefined) {
      results = results.filter(p => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter(p => p.price <= filters.maxPrice!);
    }
    
    return results;
  },

  async getProductsByBrand(brand: string): Promise<Product[]> {
    return enrichedProducts.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  },

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    return chatStore.get(sessionId) || [];
  },

  async addChatMessage(msg: InsertChatMessage): Promise<ChatMessage> {
    const message: ChatMessage = { ...msg, id: chatIdCounter++ };
    const history = chatStore.get(msg.session_id) || [];
    history.push(message);
    chatStore.set(msg.session_id, history);
    return message;
  },

  async clearChatHistory(sessionId: string): Promise<void> {
    chatStore.delete(sessionId);
  },

  // ── Members ──────────────────────────────────────────────────────────────
  async createMember(data: InsertMember): Promise<Member> {
    const id = memberIdCounter++;
    const now = new Date().toISOString();
    const member: Member = {
      ...data,
      id,
      points: 50, // registration bonus
      tier: "Silver",
      bonus_newsletter: data.bonus_newsletter ?? false,
      bonus_ig: data.bonus_ig ?? false,
      bonus_facebook: data.bonus_facebook ?? false,
      bonus_first_order: data.bonus_first_order ?? false,
      created_at: now,
      phone: data.phone ?? "",
    };
    memberStore.set(id, member);
    memberEmailIndex.set(data.email.toLowerCase(), id);
    // Log signup bonus
    pointsLogStore.push({
      id: pointsLogIdCounter++,
      member_id: id,
      delta: 50,
      reason: "Welcome bonus — account registration",
      created_at: now,
    });
    return member;
  },

  async getMemberByEmail(email: string): Promise<Member | undefined> {
    const id = memberEmailIndex.get(email.toLowerCase());
    if (id === undefined) return undefined;
    return memberStore.get(id);
  },

  async getMemberById(id: number): Promise<Member | undefined> {
    return memberStore.get(id);
  },

  async updateMember(id: number, patch: Partial<Member>): Promise<Member> {
    const existing = memberStore.get(id);
    if (!existing) throw new Error(`Member ${id} not found`);
    const updated = { ...existing, ...patch };
    memberStore.set(id, updated);
    return updated;
  },

  // ── Points ───────────────────────────────────────────────────────────────
  async addPoints(memberId: number, delta: number, reason: string): Promise<Member> {
    const member = memberStore.get(memberId);
    if (!member) throw new Error(`Member ${memberId} not found`);
    const newPoints = Math.max(0, member.points + delta);
    const newTier = calcTier(newPoints);
    const updated = { ...member, points: newPoints, tier: newTier };
    memberStore.set(memberId, updated);
    pointsLogStore.push({
      id: pointsLogIdCounter++,
      member_id: memberId,
      delta,
      reason,
      created_at: new Date().toISOString(),
    });
    return updated;
  },

  async getPointsLog(memberId: number): Promise<PointsLogEntry[]> {
    return pointsLogStore
      .filter(e => e.member_id === memberId)
      .sort((a, b) => b.id - a.id); // newest first
  },
};
