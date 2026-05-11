import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Perplexity Sonar API (OpenAI-compatible)
import OpenAI from "openai";
import type { Product } from "@shared/schema";
import crypto from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { getStockMap, appendMember, initMembersSheet, checkStockAvailability } from "./googleSheets";
import { storeResetToken, consumeResetToken } from "./storage"; // now async (PostgreSQL)
import { sendPasswordResetEmail } from "./email";
import { xero, setXeroTokens, isXeroConnected, createXeroInvoice } from "./xero";
import { createPayment, verifyCallbackSignature } from "./paymentAsia";
import { sendOrderNotificationToAdmin, sendOrderConfirmationToCustomer } from "./email";
import { db, pool } from "./db";
import { sql } from "drizzle-orm";

// Load Fine & Rare data once at startup
let fineRareData: unknown[] = [];
try {
  // Works in both CJS (process.cwd()) and ESM builds
  const candidates = [
    join(process.cwd(), "server", "fine-rare.json"),
    join(process.cwd(), "dist", "server", "fine-rare.json"),
    join(process.cwd(), "fine-rare.json"),
  ];
  for (const p of candidates) {
    try { fineRareData = JSON.parse(readFileSync(p, "utf-8")); break; } catch { /* try next */ }
  }
  if (!fineRareData.length) console.warn("[fine-rare] Could not load fine-rare.json from any candidate path");
} catch {
  console.warn("[fine-rare] Could not load fine-rare.json");
}

// Simple password hashing (SHA-256 + salt, no bcrypt dep needed)
function hashPassword(password: string): string {
  const salt = "tc-wine-salt-2024";
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Tier thresholds
const TIER_NEXT: Record<string, { next: string | null; needed: number }> = {
  Silver: { next: "Gold", needed: 1000 },
  Gold:   { next: "Platinum", needed: 3000 },
  Platinum: { next: null, needed: 0 },
};

const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY || "",
  baseURL: "https://api.perplexity.ai",
});

// Build AI sommelier system prompt with full product catalogue
async function buildSystemPrompt(): Promise<string> {
  const products = await storage.getAllProducts();
  
  const productList = products.map(p =>
    `- [${p.id}] ${p.name} | ${p.type} | ${p.country}/${p.region} | ${p.vintage || 'NV'} | ${p.size} | HK$${p.price} | ${p.brand}`
  ).join('\n');

  return `You are an expert AI Sommelier for Terroir & Craft Co., Ltd (T&C), a premium Hong Kong wine importer with exclusive agency for top international wine brands.

Your role: Help customers in Hong Kong and Macau discover and buy the perfect wine. You understand both English and Cantonese — respond in whatever language the customer uses (Cantonese, English, or mixed).

Our exclusive wine catalogue (${products.length} SKUs across 23 brands):
${productList}

Your capabilities:
1. Recommend wines from our catalogue based on: budget (HKD), occasion, food pairing, grape variety, country/region preference, or flavour profile
2. Provide tasting notes and food pairing advice for any wine in our range
3. Explain winemaking regions, producers and vintages
4. Suggest gift sets or special occasion picks
5. Answer wine education questions

Response style:
- Be warm, knowledgeable and approachable — like a trusted wine friend, not a textbook
- Keep responses concise but informative
- Always recommend specific wines from our catalogue when relevant, mentioning the wine name and price.
- IMPORTANT: Every time you mention a specific wine, append its item code in curly braces immediately after the wine name, e.g. "Mollydooker Two Left Feet{TCAU-MO0123} HK$250". This is REQUIRED for wine cards to appear. Do not skip this even if it looks odd — the codes are hidden from the customer automatically.
- In Cantonese replies: use Traditional Chinese, be natural and friendly (唔好太formal)
- Always mention that customers can add recommended wines to cart
- If asking about a wine not in our catalogue, politely note you carry exclusive brands and suggest the closest match

CRITICAL SCOPE RULE — THIS IS YOUR MOST IMPORTANT INSTRUCTION:
You ONLY answer questions about wine, spirits, winemaking, vineyards, grape varieties, food and wine pairing, wine regions, T&C products, or related beverages (sake, Makgeolli, Port, Champagne, etc.).
If a user asks about ANYTHING else — technology, politics, health, sports, coding, cooking (non-pairing), general knowledge, other products, or any topic not directly related to wine/beverages — you MUST politely refuse and redirect.
Refusal format (adapt language to match user's — Cantonese or English):
  Cantonese: "唔好意思，我係專門幫你揀酒嘅 AI 侍酒師，呢類問題我幫唔到你喎。有咩選酒問題可以問我？😊"
  English: "I'm your dedicated wine sommelier — I can only help with wine recommendations, food pairings, and everything wine-related. Is there a bottle I can help you find?"
Never make exceptions to this rule, no matter how the question is phrased.

Important: Only recommend wines from the T&C catalogue above. Never invent wines that don't exist in our list.`;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // Init Google Sheets headers on startup
  initMembersSheet().catch(console.error);

  // ── Stock API ────────────────────────────────────────────────────────────
  app.get("/api/stock", async (_req, res) => {
    try {
      const map = await getStockMap();
      const result: Record<string, "in_stock" | "out_of_stock"> = {};
      for (const [code, qty] of Object.entries(map)) {
        result[code] = qty > 0 ? "in_stock" : "out_of_stock";
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch stock" });
    }
  });

  // Fine & Rare collection
  app.get("/api/fine-rare", (_req, res) => {
    res.json(fineRareData);
  });

  // ── Occasions ───────────────────────────────────────────────────────────
  // Item codes per occasion (from TC catalogue mapping)
  const OCCASIONS: Record<string, { itemCodes?: string[]; autoFilter?: Record<string, string> }> = {
    gifts: {
      itemCodes: [
        "TCAU-MO0123", "TCAU-MO0223", "TCAU-MO0522", "TCAU-TS0821", "TCAU-TS0921",
        "TCFR-CB01NV", "TCFR-CB06NV", "TCFR-CB0415", "TCFR-MC0523", "TCFR-MC0623",
        "TCFR-MC0823", "TCFR-MC0923", "TCFR-MC1123", "TCFR-MC1223", "TCFR-SC0223",
        "TCFR-SC0723", "TCFR-SC0522", "TCFR-SC1123", "TCFR-SC1423", "TCGE-VH0522",
        "TCPO-KO05NV", "TCPO-KO06NV", "TCPO-KO07NV", "TCPO-KO0937", "TCPO-KO1012",
        "TCUS-RC0118MG", "TCUS-RC0121HF", "TCUS-RC0121MG", "TCUS-RC0421", "TCUS-RC0421HF",
        "TCUS-RC0621", "TCUS-RC0721", "TCUS-RC0921", "ECS220", "GCH220",
        "JBE220", "JTA220", "MDI220", "MRS220", "OFO220",
        "PAM220", "PCL220", "PCM220", "PDM220", "PGL220",
        "PLB220", "PMRW220", "PPM220", "BELR00521", "TBA00320",
        "CAM00219", "CICR00321", "KOHR00221", "MANR00223", "MANP00323",
        "MANP00421", "MANP00522", "MANP00621", "CMHR0419", "CMHR0722",
        "CMHR1221", "CMHR1423",
      ],
    },
    under300: {
      autoFilter: { maxPrice: "300" },
    },
    champagne: {
      autoFilter: { types: "Champagne,Sparkling" },
    },
    easyreds: {
      itemCodes: [
        "TCAU-MO0324", "TCAU-MO0422", "TCAU-MO0823", "TCAU-MO0923", "TCAU-TS0121",
        "TCAU-TS0222", "TCAU-TS0321", "TCAU-TS0322", "TCAU-TS0423", "TCAU-LBJ0120",
        "TCAU-LBJ0216", "OTHER-01", "OTHER-06", "OTHER-10", "TCFR-MC1023",
        "TCFR-SC0323", "TCFR-SC0522", "TCFR-SC0624", "TCFR-SC0823", "TCFR-SC09NV",
        "TCNZ-SH0123", "TCSP-TC0214", "PPCM220", "MAR00323", "CSWR00123",
        "CSWR00223", "BELR00223", "TBA00122", "MALR00222", "CICR00123",
        "KOHR00221", "MANR00122", "CMHR0122",
      ],
    },
    staffpicks: {
      itemCodes: [
        "TCAU-MO0123", "TCAU-MO0522", "TCAU-TS0222", "TCAU-TS0821", "TCAU-TS0921",
        "TCAU-LBJ0216", "TCFR-CB06NV", "TCFR-MC0323", "TCFR-MC0423", "TCFR-MC0523",
        "TCFR-MC0623", "TCFR-MC0723", "TCFR-SC0123", "TCFR-SC1123", "TCFR-SC1223",
        "TCFR-SC1423", "DAFR-DN0121", "TCGE-VH0121", "TCGE-VH0723", "TCKR- CA01NV",
        "TCPO-KO05NV", "TCPO-KO07NV", "TCPO-KO0937", "VINSA-CC0123", "TCUS-RC0122",
        "TCUS-RC0324", "TCUS-RC0421", "TCUS-RC0621", "TCUS-RC0721", "ECS220",
        "GCH220", "MDI220", "MRS220", "PLB220", "PMRW220",
        "MAR00123", "CSW00123", "BELR00422", "TBA00220", "MALW00124",
        "MALR00122", "CICW00222", "CICR00321", "KOHN001NV", "KOHB00124",
        "MAN00623", "MANR00223", "MANP00621", "MAN00123", "CMHR0223",
        "CMHR0322", "CMHR0419", "CMHR1423", "CMHW0223",
      ],
    },
    bbq: {
      itemCodes: [
        "TCAU-MO0622", "TCAU-MO0623", "TCAU-MO1023", "TCAU-MO1125", "TCAU-TS0322",
        "TCAU-TS0423", "TCAU-LBJ0120", "TCFR-CB01NV", "TCFR-CB03NV", "TCFR-SC0123",
        "TCFR-SC0223", "TCFR-SC0323", "TCFR-SC09NV", "TCFR-SC13NV", "TCGE-VH0223",
        "TCGE-VH0323", "VINIT-PQ0324", "TCKR- CA01NV", "TCKR- CA02NV", "TCKR- CA03NV",
        "TCKR- CA04NV", "TCNZ-SH0123", "TCNZ-SH0224", "TCPO-KO01NV", "TCPO-KO02NV",
        "TCSP-TC0214", "TCUS-RC0223", "MAR00123", "MAR00223", "MAR00323",
        "CSW00123", "CSW00223", "CSWR00123", "CSWR00223", "BELW00124",
        "BELR00321", "BEVW00123", "BEVR00123", "MALR00222", "MALR00320",
        "KOHW00624", "KOHW00322", "KOHB00124", "MAN00323", "CMHR0223",
        "CMHR0321", "CMHW0122", "CMHW0322",
      ],
    },
    hotpot: {
      itemCodes: [
        "TCAU-MO1125", "TCAU-MO1224", "TCAU-TS0121", "TCFR-MC0123", "TCFR-MC0223",
        "TCFR-MC1023", "TCFR-MC1122", "TCFR-SC0522", "TCGE-VH0121", "TCGE-VH0422",
        "TCGE-VH0623", "VINIT-PQ0324", "TCKR- CA01NV", "TCKR- CA02NV", "TCKR- CA03NV",
        "TCKR- CA04NV", "TCNZ-SH0423", "TCPO-KO03NV", "TCCA-PG", "TCUS-RC0324",
        "ALPSB24001", "MAR00123", "MAR00223", "MAR00323", "CSW00123",
        "CICR00123", "KOHW00624", "KOHW00322", "KOHG00123", "KOHS00122",
        "MAN00423", "MAN00123", "CMHW0122", "CMHW0422", "CMHW05241",
      ],
    },
  };

  app.get("/api/occasions/:occasion", async (req, res) => {
    try {
      const occ = OCCASIONS[req.params.occasion.toLowerCase()];
      if (!occ) return res.status(404).json({ error: "Unknown occasion" });

      const allProducts = await storage.getAllProducts();

      let result;
      if (occ.autoFilter) {
        const { maxPrice, types } = occ.autoFilter;
        result = allProducts.filter(p => {
          const effectivePrice = (p as any).promo_price ?? p.price;
          if (maxPrice && effectivePrice > Number(maxPrice)) return false;
          if (types) {
            const typeList = types.split(",");
            if (!typeList.some(t => p.type.toLowerCase() === t.toLowerCase())) return false;
          }
          return true;
        });
      } else if (occ.itemCodes) {
        const codeSet = new Set(occ.itemCodes);
        result = allProducts.filter(p => codeSet.has(p.id));
        // Sort to match the order in itemCodes
        result.sort((a, b) => occ.itemCodes!.indexOf(a.id) - occ.itemCodes!.indexOf(b.id));
      } else {
        result = allProducts;
      }

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch occasion products" });
    }
  });

  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const { search, type, country, minPrice, maxPrice } = req.query;
      
      const products = await storage.searchProducts(
        (search as string) || "",
        {
          type: type as string | undefined,
          country: country as string | undefined,
          minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        }
      );
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Get products by brand
  app.get("/api/brands/:brand/products", async (req, res) => {
    try {
      const products = await storage.getProductsByBrand(req.params.brand);
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch brand products" });
    }
  });

  // Get all brands
  app.get("/api/brands", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      const brands = [...new Set(products.map(p => p.brand))].sort();
      res.json(brands);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch brands" });
    }
  });

  // Get filter options
  app.get("/api/filters", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      const types = [...new Set(products.map(p => p.type))].sort();
      const countries = [...new Set(products.map(p => p.country))].sort();
      const brands = [...new Set(products.map(p => p.brand))].sort();
      res.json({ types, countries, brands });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch filters" });
    }
  });

  // AI Sommelier chat — streaming (members only)
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId, language, memberId } = req.body;
      if (!message || !sessionId) {
        return res.status(400).json({ error: "message and sessionId required" });
      }

      // Members-only gate
      if (!memberId) {
        return res.status(401).json({ error: "members_only", message: "AI Sommelier is available to members only. Please log in or register for free." });
      }
      // Verify member exists in DB
      const memberRow = await storage.getMemberById(memberId);
      if (!memberRow) {
        return res.status(401).json({ error: "members_only", message: "Invalid member session. Please log in again." });
      }

      // Save user message
      await storage.addChatMessage({ session_id: sessionId, role: "user", content: message });

      // Get conversation history
      const history = await storage.getChatHistory(sessionId);
      const systemPrompt = await buildSystemPrompt();

      // Build messages for Claude
      const messages = history.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let fullResponse = "";

      try {
        const stream = await perplexity.chat.completions.create({
          model: "sonar",
          max_tokens: 1024,
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            fullResponse += text;
            res.write(`data: ${JSON.stringify({ type: "text", text })}\n\n`);
          }
        }

        // Save assistant response
        await storage.addChatMessage({ session_id: sessionId, role: "assistant", content: fullResponse });
        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        res.end();
      } catch (streamErr) {
        console.error("Perplexity stream error:", streamErr);
        res.write(`data: ${JSON.stringify({ type: "error", message: "Sorry, something went wrong." })}\n\n`);
        res.end();
      }

    } catch (err) {
      console.error("Chat error:", err);
      res.status(500).json({ error: "Chat failed" });
    }
  });

  // Get chat history
  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const history = await storage.getChatHistory(req.params.sessionId);
      res.json(history);
    } catch (err) {
      res.status(500).json({ error: "Failed to get chat history" });
    }
  });

  // Clear chat
  app.delete("/api/chat/:sessionId", async (req, res) => {
    try {
      await storage.clearChatHistory(req.params.sessionId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to clear chat" });
    }
  });

  // ───────────────────────────────────────────────────────────────────
  // MEMBER ROUTES
  // ───────────────────────────────────────────────────────────────────

  // Register
  app.post("/api/members/register", async (req, res) => {
    try {
      const { email, name, phone, password } = req.body;
      if (!email || !name || !password) {
        return res.status(400).json({ error: "email, name and password are required" });
      }
      const existing = await storage.getMemberByEmail(email);
      if (existing) {
        return res.status(409).json({ error: "Email already registered" });
      }
      const member = await storage.createMember({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        phone: phone || "",
        password_hash: hashPassword(password),
        points: 0,
        tier: "Silver",
        bonus_newsletter: false,
        bonus_ig: false,
        bonus_facebook: false,
        bonus_first_order: false,
        created_at: new Date().toISOString(),
      });
      // Return member without password_hash
      const { password_hash: _, ...safe } = member;

      // Sync new member to Google Sheets (non-blocking)
      appendMember({
        name: member.name,
        email: member.email,
        phone: member.phone || "",
        points: member.points,
        source: "Website Registration",
      }).catch(console.error);

      res.status(201).json(safe);
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login
  app.post("/api/members/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
      }
      const member = await storage.getMemberByEmail(email.toLowerCase().trim());
      if (!member || !verifyPassword(password, member.password_hash)) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const { password_hash: _, ...safe } = member;
      res.json(safe);
    } catch (err) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get member profile
  app.get("/api/members/:id", async (req, res) => {
    try {
      const member = await storage.getMemberById(Number(req.params.id));
      if (!member) return res.status(404).json({ error: "Member not found" });
      const { password_hash: _, ...safe } = member;
      res.json(safe);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch member" });
    }
  });

  // Get points log
  app.get("/api/members/:id/points", async (req, res) => {
    try {
      const log = await storage.getPointsLog(Number(req.params.id));
      res.json(log);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch points log" });
    }
  });

  // Member order history
  app.get("/api/members/:id/orders", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const result = await db.execute(sql`
        SELECT id, order_ref, amount_paid, points_redeemed, items_json, created_at, xero_status
        FROM orders WHERE member_id = ${id} ORDER BY created_at DESC LIMIT 50
      `);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Claim bonus action (newsletter / ig / facebook)
  app.post("/api/members/:id/bonus", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { action } = req.body; // "newsletter" | "ig" | "facebook"
      const member = await storage.getMemberById(id);
      if (!member) return res.status(404).json({ error: "Member not found" });

      const bonusMap: Record<string, { flag: keyof typeof member; points: number; reason: string }> = {
        newsletter: { flag: "bonus_newsletter", points: 30, reason: "Newsletter subscription bonus" },
        ig:         { flag: "bonus_ig",         points: 20, reason: "Follow on Instagram bonus" },
        facebook:   { flag: "bonus_facebook",   points: 20, reason: "Follow on Facebook bonus" },
      };

      const bonus = bonusMap[action];
      if (!bonus) return res.status(400).json({ error: "Unknown bonus action" });
      if (member[bonus.flag]) return res.status(409).json({ error: "Bonus already claimed" });

      await storage.updateMember(id, { [bonus.flag]: true } as any);
      const updated = await storage.addPoints(id, bonus.points, bonus.reason);
      const { password_hash: _, ...safe } = updated;
      res.json(safe);
    } catch (err) {
      res.status(500).json({ error: "Failed to claim bonus" });
    }
  });

  // Update delivery info (phone, address, district)
  app.patch("/api/members/:id/delivery", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { phone, address, district } = req.body;
      const updated = await storage.updateMember(id, {
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address } as any),
        ...(district !== undefined && { district } as any),
      });
      const { password_hash: _, ...safe } = updated;
      res.json(safe);
    } catch (err) {
      res.status(500).json({ error: "Failed to update delivery info" });
    }
  });

  // Record purchase — award points + first-order bonus
  app.post("/api/members/:id/purchase", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { totalHKD } = req.body; // total in HKD
      if (!totalHKD || totalHKD <= 0) {
        return res.status(400).json({ error: "totalHKD required" });
      }
      const member = await storage.getMemberById(id);
      if (!member) return res.status(404).json({ error: "Member not found" });

      // HK$5 = 1 point
      const earnedPoints = Math.floor(totalHKD / 5);
      let updated = await storage.addPoints(id, earnedPoints, `Purchase HK$${totalHKD} — ${earnedPoints} pts`);

      // First-order bonus
      if (!updated.bonus_first_order) {
        await storage.updateMember(id, { bonus_first_order: true });
        updated = await storage.addPoints(id, 100, "First order bonus");
      }

      const { password_hash: _, ...safe } = updated;
      res.json({ member: safe, pointsEarned: earnedPoints + (!member.bonus_first_order ? 100 : 0) });
    } catch (err) {
      res.status(500).json({ error: "Failed to record purchase" });
    }
  });

  // ── Password Reset ──────────────────────────────────────────────────────────
  // Step 1: request reset link
  app.post("/api/members/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email required" });

      const member = await storage.getMemberByEmail(email.toLowerCase().trim());
      // Always return 200 — don't reveal whether email exists
      if (!member) {
        console.log(`[Reset] No member found for ${email}`);
        return res.json({ ok: true });
      }

      // Generate secure random token
      const token = crypto.randomBytes(32).toString("hex");
      await storeResetToken(member.id, token);

      const baseUrl = process.env.BASE_URL || "https://terroir-craft-production.up.railway.app";
      await sendPasswordResetEmail(member.email, member.name, token, baseUrl);

      res.json({ ok: true });
    } catch (err) {
      console.error("[Reset] forgot-password error:", err);
      // Still return ok to not leak info
      res.json({ ok: true });
    }
  });

  // Step 2: submit new password using token
  app.post("/api/members/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) return res.status(400).json({ error: "Token and password required" });
      if (password.length < 6) return res.status(400).json({ error: "密碼最少 6 個字元" });

      const memberId = await consumeResetToken(token);
      if (!memberId) return res.status(400).json({ error: "連結已失效或已使用，請重新申請" });

      await storage.updateMember(memberId, { password_hash: hashPassword(password) });
      console.log(`[Reset] Password reset for member ${memberId}`);

      res.json({ ok: true });
    } catch (err) {
      console.error("[Reset] reset-password error:", err);
      res.status(500).json({ error: "Reset failed" });
    }
  });

  // ── Payment Asia ───────────────────────────────────────────────────────────
  // In-memory pending orders store { merchantReference -> order details }
  const pendingOrders = new Map<string, {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    deliveryAddress?: string;
    isGift?: boolean;
    recipientName?: string;
    recipientPhone?: string;
    memberId?: number;
    referredBy?: string;
    amount: number;
    pointsRedeemed?: number;
    items: Array<{ name: string; itemCode: string; quantity: number; unitPrice: number }>;
    createdAt: number;
  }>();

  // Create payment — stores order details + gets Payment Asia URL
  app.post("/api/payment/create", async (req, res) => {
    try {
      const { merchantReference, amount, customerName, customerEmail, customerPhone, subject, memberId, referredBy, items } = req.body;
      if (!merchantReference || !amount || !customerName || !customerEmail) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Stock availability check before redirecting to payment
      if (items && items.length > 0) {
        const stockCheck = await checkStockAvailability(items);
        if (!stockCheck.ok) {
          return res.status(409).json({ error: `Stock issue: ${stockCheck.issues.join(", ")}` });
        }
      }

      const { isGift, recipientName, recipientPhone, deliveryAddress, pointsRedeemed } = req.body;

      // Store order details so callback can open Xero invoice
      pendingOrders.set(merchantReference, {
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        isGift: !!isGift,
        recipientName,
        recipientPhone,
        memberId,
        referredBy,
        amount: Number(amount),
        pointsRedeemed: Number(pointsRedeemed) || 0,
        items: items || [],
        createdAt: Date.now(),
      });

      // Also persist to DB so order survives server restarts
      try {
        await db.execute(sql`
          INSERT INTO pending_orders (merchant_reference, order_json)
          VALUES (${merchantReference}, ${JSON.stringify(pendingOrders.get(merchantReference))})
          ON CONFLICT (merchant_reference) DO UPDATE SET order_json = EXCLUDED.order_json
        `);
      } catch (dbErr) {
        console.warn("[PendingOrder] DB persist failed (non-fatal):", dbErr);
      }

      // Clean up old pending orders (>24h)
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      for (const [k, v] of pendingOrders.entries()) {
        if (v.createdAt < cutoff) pendingOrders.delete(k);
      }

      const customerIp = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "127.0.0.1")
        .split(",")[0].trim();

      const result = await createPayment({
        merchantReference,
        amount: Number(amount),
        customerName,
        customerEmail,
        customerPhone,
        customerIp,
        subject: subject || "Terroir & Craft Order",
      });

      res.json(result);
    } catch (err) {
      console.error("[PaymentAsia] create error:", err);
      res.status(500).json({ error: "Payment creation failed" });
    }
  });

  // Callback from Payment Asia (POST webhook)
  app.post("/api/payment/callback", async (req, res) => {
    // Must respond quickly — Payment Asia expects fast response
    res.json({ status: "ok" });

    try {
      const body = req.body as Record<string, string>;
      console.log("[PaymentAsia] Callback received:", JSON.stringify(body));

      const { merchant_reference, status, amount } = body;
      // Per Payment Asia docs: status=1 means SUCCESS
      const isPaid = status === "1" || status === "paid" || status === "success" || status === "SUCCESS";

      if (!isPaid || !merchant_reference) {
        console.log(`[PaymentAsia] Not a successful payment. Status: ${status}`);
        return;
      }

      console.log(`[PaymentAsia] Payment confirmed: ${merchant_reference} HKD ${amount}`);

      // Retrieve stored order details — check memory first, then DB
      let order = pendingOrders.get(merchant_reference);
      if (!order) {
        try {
          const dbRow = await db.execute(sql`
            SELECT order_json FROM pending_orders WHERE merchant_reference = ${merchant_reference}
          `);
          if (dbRow.rows?.[0]) {
            order = JSON.parse((dbRow.rows[0] as any).order_json);
            console.log(`[PaymentAsia] Recovered pending order from DB for ${merchant_reference}`);
          }
        } catch {}
      }
      if (!order) {
        // Pending order may have been wiped by a server restart.
        // Reconstruct minimal order from callback body so we still save a record.
        console.warn(`[PaymentAsia] No pending order for ${merchant_reference} — rebuilding from callback body`);
        const cbName = (body.customer_name || body.payer_name || body.name || "") as string;
        const cbEmail = (body.customer_email || body.email || body.payer_email || "") as string;
        const cbPhone = (body.customer_phone || body.phone || "") as string;
        // Try to find member by email
        let fallbackMemberId: number | undefined;
        if (cbEmail) {
          try {
            const mem = await storage.getMemberByEmail(cbEmail);
            if (mem) fallbackMemberId = mem.id;
          } catch {}
        }
        order = {
          customerName: cbName,
          customerEmail: cbEmail,
          customerPhone: cbPhone,
          deliveryAddress: (body.delivery_address || "") as string,
          isGift: false,
          recipientName: "",
          recipientPhone: "",
          memberId: fallbackMemberId,
          referredBy: "",
          amount: Number(amount),
          pointsRedeemed: 0,
          items: [],
          createdAt: Date.now(),
        };
      }

      pendingOrders.delete(merchant_reference); // consume it

      // STEP 1: Save order to PostgreSQL IMMEDIATELY — this is the safety net
      // Even if Xero/email fail, this record is permanent
      let dbOrderId: number | null = null;
      try {
        const result = await db.execute(sql`
          INSERT INTO orders (
            order_ref, customer_name, customer_email, customer_phone,
            delivery_address, is_gift, recipient_name, items_json,
            amount_paid, points_redeemed, referred_by, member_id
          ) VALUES (
            ${merchant_reference},
            ${order.customerName},
            ${order.customerEmail},
            ${order.customerPhone || ""},
            ${order.deliveryAddress || ""},
            ${order.isGift || false},
            ${order.recipientName || ""},
            ${JSON.stringify(order.items)},
            ${order.amount},
            ${order.pointsRedeemed || 0},
            ${order.referredBy || ""},
            ${order.memberId ?? null}
          )
          ON CONFLICT (order_ref) DO NOTHING
          RETURNING id
        `);
        dbOrderId = (result.rows?.[0] as any)?.id ?? null;
        console.log(`[Order] Saved to DB: ${merchant_reference} (id=${dbOrderId})`);

        // Populate order_lines for sales record
        if (order.items && order.items.length > 0) {
          // Look up member tier for discount context
          let memberTier = "";
          let tierDiscountRate = 0;
          if (order.memberId) {
            try {
              const mem = await storage.getMemberById(order.memberId);
              memberTier = mem?.tier || "";
              const TIER_RATES: Record<string, number> = { Silver: 0.05, Gold: 0.08, Platinum: 0.10 };
              tierDiscountRate = TIER_RATES[memberTier] || 0;
            } catch {}
          }

          // Load products to get original prices and brand info
          const allProducts = await storage.getAllProducts();
          const productMap = new Map(allProducts.map(p => [p.id, p]));

          for (const item of order.items) {
            const product = productMap.get(item.itemCode);
            const originalPrice = product?.price ?? item.unitPrice;
            const isPromo = product ? !!product.promo_price : false;
            const isExclusive = (product as any)?.exclusive === true;
            // unit_price is what was actually charged (promo_price ?? price, then tier discount applied)
            const unitPriceCharged = isExclusive && !isPromo
              ? item.unitPrice  // already tier-discounted from client
              : item.unitPrice;
            const lineTotal = unitPriceCharged * item.quantity;

            try {
              await db.execute(sql`
                INSERT INTO order_lines (
                  order_ref, item_code, item_name, brand, quantity,
                  original_price, unit_price, tier_discount_rate, line_total, is_promo,
                  customer_name, customer_email, customer_phone, delivery_address,
                  referred_by, member_id, member_tier, points_redeemed, order_total,
                  is_gift, recipient_name, created_at
                ) VALUES (
                  ${merchant_reference}, ${item.itemCode || ""}, ${item.name || ""},
                  ${product?.brand || ""}, ${item.quantity},
                  ${originalPrice}, ${unitPriceCharged}, ${tierDiscountRate}, ${lineTotal}, ${isPromo},
                  ${order.customerName}, ${order.customerEmail}, ${order.customerPhone || ""},
                  ${order.deliveryAddress || ""}, ${order.referredBy || ""},
                  ${order.memberId ?? null}, ${memberTier}, ${order.pointsRedeemed || 0},
                  ${order.amount}, ${order.isGift || false}, ${order.recipientName || ""},
                  NOW()
                )
              `);
            } catch (lineErr) {
              console.error(`[OrderLines] Failed to insert line for ${item.itemCode}:`, lineErr);
            }
          }
          console.log(`[OrderLines] Saved ${order.items.length} lines for ${merchant_reference}`);
        }
      } catch (dbErr) {
        console.error("[Order] DB save failed:", dbErr);
      }

      // STEP 2: Send admin notification email immediately
      sendOrderNotificationToAdmin(
        merchant_reference,
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        order.deliveryAddress,
        order.items,
        order.amount,
        order.referredBy,
        order.isGift || false,
        order.recipientName,
      ).catch(e => console.error("[Order] Admin email error:", e));

      // STEP 3: Send customer confirmation email (via Resend as backup, regardless of Xero)
      let customerEmailStatus = "pending";
      try {
        await sendOrderConfirmationToCustomer(
          merchant_reference,
          order.customerName,
          order.customerEmail,
          order.items,
          order.amount,
        );
        customerEmailStatus = "sent";
      } catch (emailErr) {
        console.error("[Order] Customer email error:", emailErr);
        customerEmailStatus = "failed";
      }

      // STEP 4: Create Xero invoice (AUTHORISED + PAID + Xero's own email)
      let xeroInvoice = "";
      let xeroStatus = "skipped";
      if (isXeroConnected() && order.items.length > 0) {
        try {
          const invoiceNumber = await createXeroInvoice({
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            deliveryAddress: order.deliveryAddress,
            isGift: order.isGift,
            recipientName: order.recipientName,
            recipientPhone: order.recipientPhone,
            items: order.items,
            referredBy: order.referredBy,
            orderRef: merchant_reference,
            amountPaid: order.amount,
          });
          xeroInvoice = invoiceNumber || "";
          xeroStatus = invoiceNumber ? "created" : "failed";
          console.log(`[PaymentAsia] Xero invoice: ${invoiceNumber} for ${order.customerEmail}`);
        } catch (xeroErr) {
          console.error("[PaymentAsia] Xero invoice error:", xeroErr);
          xeroStatus = "error";
        }
      } else {
        xeroStatus = isXeroConnected() ? "no_items" : "not_connected";
        console.warn(`[PaymentAsia] Xero skipped: ${xeroStatus}`);
      }

      // Update DB record with Xero + email status
      if (dbOrderId) {
        db.execute(sql`
          UPDATE orders SET
            xero_invoice = ${xeroInvoice},
            xero_status = ${xeroStatus},
            email_status = ${customerEmailStatus}
          WHERE id = ${dbOrderId}
        `).catch(e => console.error("[Order] DB update failed:", e));
        // Also update xero_invoice on order_lines
        db.execute(sql`
          UPDATE order_lines SET xero_invoice = ${xeroInvoice}
          WHERE order_ref = ${merchant_reference}
        `).catch(e => console.error("[OrderLines] Xero update failed:", e));
      }

      // STEP 5: Award / deduct loyalty points
      if (order.memberId) {
        try {
          const member = await storage.getMemberById(order.memberId);
          if (member) {
            // Deduct redeemed points first
            if (order.pointsRedeemed && order.pointsRedeemed > 0) {
              await storage.addPoints(
                order.memberId,
                -order.pointsRedeemed,
                `Points redeemed at checkout (${merchant_reference})`
              );
            }
            // Award earn points on final amount paid
            const pts = Math.floor(order.amount / 5);
            if (pts > 0) {
              await storage.addPoints(order.memberId, pts, `Purchase HK$${order.amount} (${merchant_reference})`);
            }
            // First order bonus
            if (!member.bonus_first_order) {
              await storage.updateMember(order.memberId, { bonus_first_order: true });
              await storage.addPoints(order.memberId, 100, "First order bonus");
            }
            console.log(`[PaymentAsia] Points: -${order.pointsRedeemed || 0} redeemed, +${pts} earned`);
          }
        } catch (ptsErr) {
          console.error("[PaymentAsia] Points error:", ptsErr);
        }
      }

    } catch (err) {
      console.error("[PaymentAsia] Callback processing error:", err);
    }
  });

  // Return URL after payment (GET — redirect customer back to site)
  // Always redirect to www.terroirandcraft.online — Railway URL is only for API calls
  app.get("/api/payment/return", (req, res) => {
    const ref = (req.query.ref as string) || "";
    const dest = `https://www.terroirandcraft.online/#/payment-result?ref=${encodeURIComponent(ref)}`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.send(`<!DOCTYPE html><html><head>
<meta http-equiv="refresh" content="0;url=${dest}">
<script>window.location.replace(${JSON.stringify(dest)});</script>
</head><body>Redirecting... <a href="${dest}">Click here</a></body></html>`);
  });

  // ── Xero OAuth ────────────────────────────────────────────────────────────
  // Step 1: redirect to Xero login
  app.get("/api/xero/connect", async (_req, res) => {
    try {
      const url = await xero.buildConsentUrl();
      res.redirect(url);
    } catch (err) {
      res.status(500).json({ error: "Failed to build Xero consent URL" });
    }
  });

  // Step 2: Xero redirects back with code
  // Bypass xero-node state check (fails on Railway CDN) — exchange code directly
  app.get("/api/xero/callback", async (req, res) => {
    try {
      const code = req.query.code as string;
      if (!code) throw new Error("No authorization code received from Xero");

      const XERO_CLIENT_ID = process.env.XERO_CLIENT_ID || "2CCF339348184115A8DA65454817F574";
      const XERO_CLIENT_SECRET = process.env.XERO_CLIENT_SECRET || "aWYx_6-jUnEt1lVsI9PKv3bmSJWlQ4zeBzm-BZpVr55l1pg4";
      const XERO_REDIRECT_URI = (process.env.XERO_REDIRECT_URI || "https://terroir-craft-production.up.railway.app/api/xero/callback").trim();

      // Exchange code for tokens directly (no state check)
      const tokenResp = await fetch("https://identity.xero.com/connect/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Basic " + Buffer.from(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`).toString("base64"),
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: XERO_REDIRECT_URI,
        }).toString(),
      });

      if (!tokenResp.ok) {
        const errText = await tokenResp.text();
        throw new Error(`Token exchange failed (${tokenResp.status}): ${errText}`);
      }

      const tokens = await tokenResp.json() as any;
      console.log("[Xero] Tokens received, fetching tenants...");

      // Set tokens on xero client so invoice calls work
      xero.setTokenSet(tokens);

      // Get tenants
      const tenantsResp = await fetch("https://api.xero.com/connections", {
        headers: { "Authorization": `Bearer ${tokens.access_token}` },
      });
      const tenants = await tenantsResp.json() as any[];
      if (!tenants || tenants.length === 0) throw new Error("No Xero organisations found. Make sure you authorised the correct account.");

      const tenantId = tenants[0].tenantId;
      const tenantName = tenants[0].tenantName;
      setXeroTokens(tokens, tenantId);

      console.log(`[Xero] Connected! Tenant: ${tenantName} (${tenantId})`);
      res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:60px;color:#333">
        <h2 style="color:#2e7d32">&#x2705; Xero Connected!</h2>
        <p>Terroir &amp; Craft is now connected to Xero.</p>
        <p>Organisation: <strong>${tenantName}</strong></p>
        <p style="margin-top:2rem"><a href="/#/" style="color:#6b1d2a">Return to website</a></p>
      </body></html>`);
    } catch (err: any) {
      console.error("[Xero] Callback error:", err?.message || err);
      res.status(500).send(`<html><body style="font-family:sans-serif;text-align:center;padding:60px;color:#333">
        <h2 style="color:#c62828">Xero connection failed</h2>
        <p>${err?.message || "Unknown error"}</p>
        <p><a href="/api/xero/connect" style="color:#6b1d2a">Try again</a></p>
      </body></html>`);
    }
  });

  // Status check
  app.get("/api/xero/status", (_req, res) => {
    res.json({ connected: isXeroConnected() });
  });

  // ── Order API (creates Xero Invoice) ─────────────────────────────────────────
  app.post("/api/orders", async (req, res) => {
    try {
      const { customerName, customerEmail, items, referredBy, memberId } = req.body;

      if (!customerName || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Missing required order fields" });
      }

      // Generate order reference
      const orderRef = `TC-${Date.now().toString(36).toUpperCase()}`;

      // Create Xero invoice (non-blocking on failure)
      const invoiceNumber = await createXeroInvoice({
        customerName,
        customerEmail,
        items,
        referredBy,
        orderRef,
      });

      console.log(`[Order] ${orderRef} created | Customer: ${customerEmail} | Ref: ${referredBy || 'direct'} | Invoice: ${invoiceNumber || 'pending'}`);

      res.json({
        success: true,
        orderRef,
        invoiceNumber,
        message: invoiceNumber
          ? `Order confirmed. Invoice ${invoiceNumber} sent to ${customerEmail}.`
          : `Order confirmed. Invoice will be sent to ${customerEmail} shortly.`,
      });
    } catch (err) {
      console.error("[Order] Error:", err);
      res.status(500).json({ error: "Failed to process order" });
    }
  });

  // ── Admin: view all orders from DB ───────────────────────────────────────────
  // Protected by simple secret key in header or query
  app.get("/api/admin/orders", async (req, res) => {
    const secret = req.query.secret || req.headers["x-admin-secret"];
    if (secret !== (process.env.ADMIN_SECRET || "tc-admin-2026")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const result = await db.execute(sql`
        SELECT id, order_ref, customer_name, customer_email, customer_phone,
               delivery_address, is_gift, recipient_name, items_json,
               amount_paid, points_redeemed, referred_by, member_id,
               xero_invoice, xero_status, email_status, created_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 200
      `);
      res.json({ orders: result.rows });
    } catch (err) {
      console.error("[admin/orders] DB error:", err);
      res.status(500).json({ error: "Failed to fetch orders", detail: String(err) });
    }
  });

  // One-time: force create promo_codes table and seed initial codes
  app.get("/api/admin/init-promo", async (req, res) => {
    const secret = req.query.secret;
    if (secret !== (process.env.ADMIN_SECRET || "tc-admin-2026")) return res.status(401).json({ error: "Unauthorized" });
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS promo_codes (
          id SERIAL PRIMARY KEY, code TEXT NOT NULL UNIQUE,
          description TEXT NOT NULL DEFAULT '', discount_type TEXT NOT NULL DEFAULT 'fixed',
          discount_value NUMERIC NOT NULL DEFAULT 0, min_order NUMERIC NOT NULL DEFAULT 0,
          max_uses INTEGER, used_count INTEGER NOT NULL DEFAULT 0,
          active BOOLEAN NOT NULL DEFAULT TRUE, expires_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(`
        INSERT INTO promo_codes (code, description, discount_type, discount_value, min_order, active)
        VALUES ('MolldydookerWD2026', 'Mollydooker Wine Deal 2026 - HK$200 off HK$1000+', 'fixed', 200, 1000, true)
        ON CONFLICT (code) DO NOTHING
      `);
      const r = await pool.query('SELECT * FROM promo_codes');
      res.json({ ok: true, codes: r.rows });
    } catch(e) { res.status(500).json({ error: String(e) }); }
  });

  // Promo code validation
  app.post("/api/promo/validate", async (req, res) => {
    try {
      const { code, orderTotal } = req.body;
      if (!code) return res.status(400).json({ error: "No code provided" });
      const result = await pool.query(
        `SELECT * FROM promo_codes
         WHERE UPPER(code) = UPPER($1)
         AND active = true
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_uses IS NULL OR used_count < max_uses)`,
        [code]
      );
      const promo = result.rows?.[0] as any;
      if (!promo) return res.status(404).json({ error: "Invalid or expired promo code" });
      const minOrder = Number(promo.min_order);
      if (orderTotal < minOrder) {
        return res.status(400).json({ error: `Minimum order HK$${minOrder.toLocaleString()} required`, minOrder });
      }
      const discount = promo.discount_type === 'percent'
        ? Math.round(orderTotal * Number(promo.discount_value) / 100)
        : Number(promo.discount_value);
      res.json({
        valid: true,
        code: promo.code,
        description: promo.description,
        discountType: promo.discount_type,
        discountValue: Number(promo.discount_value),
        discount,
        minOrder,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to validate promo code" });
    }
  });

  // Admin order lines (sales record)
  app.get("/api/admin/order-lines", async (req, res) => {
    const secret = req.query.secret || req.headers["x-admin-secret"];
    if (secret !== (process.env.ADMIN_SECRET || "tc-admin-2026")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const result = await db.execute(sql`
        SELECT order_ref, item_code, item_name, brand, quantity,
               original_price, unit_price, tier_discount_rate, line_total, is_promo,
               customer_name, customer_email, customer_phone, delivery_address,
               referred_by, member_tier, points_redeemed, order_total,
               is_gift, recipient_name, xero_invoice, created_at
        FROM order_lines
        ORDER BY created_at DESC
        LIMIT 1000
      `);
      res.json({ lines: result.rows });
    } catch (err) {
      console.error("[admin/order-lines] DB error:", err);
      res.status(500).json({ error: "Failed to fetch order lines", detail: String(err) });
    }
  });

  // Admin members
  app.get("/api/admin/members", async (req, res) => {
    const secret = req.query.secret || req.headers["x-admin-secret"];
    if (secret !== (process.env.ADMIN_SECRET || "tc-admin-2026")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const result = await db.execute(sql`
        SELECT id, name, email, phone, tier, points, created_at
        FROM members ORDER BY created_at DESC LIMIT 500
      `);
      res.json({ members: result.rows });
    } catch (err) {
      console.error("[admin/members] DB error:", err);
      res.status(500).json({ error: "Failed to fetch members", detail: String(err) });
    }
  });

  return httpServer;
}
