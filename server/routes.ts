import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Anthropic from "@anthropic-ai/sdk";
import type { Product } from "@shared/schema";
import crypto from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { getStockMap, appendMember, initMembersSheet } from "./googleSheets";
import { storeResetToken, consumeResetToken } from "./storage"; // now async (PostgreSQL)
import { sendPasswordResetEmail } from "./email";
import { xero, setXeroTokens, isXeroConnected, createXeroInvoice } from "./xero";
import { createPayment, verifyCallbackSignature } from "./paymentAsia";

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

const anthropic = new Anthropic();

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
- Always recommend specific wines from our catalogue when relevant, citing the item ID and price
- In Cantonese replies: use Traditional Chinese, be natural and friendly (唔好太formal)
- Always mention that customers can add recommended wines to cart
- If asking about a wine not in our catalogue, politely note you carry exclusive brands and suggest the closest match

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

  // AI Sommelier chat — streaming
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId, language } = req.body;
      if (!message || !sessionId) {
        return res.status(400).json({ error: "message and sessionId required" });
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

      const stream = anthropic.messages.stream({
        model: "claude_sonnet_4_6",
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      });

      stream.on("text", (text) => {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ type: "text", text })}\n\n`);
      });

      stream.on("finalMessage", async () => {
        // Save assistant response
        await storage.addChatMessage({ session_id: sessionId, role: "assistant", content: fullResponse });
        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        res.end();
      });

      stream.on("error", (err) => {
        console.error("Stream error:", err);
        res.write(`data: ${JSON.stringify({ type: "error", message: "Sorry, something went wrong." })}\n\n`);
        res.end();
      });

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
  // Create payment — generates HTML auto-submit form to Payment Asia hosted page
  app.post("/api/payment/create", async (req, res) => {
    try {
      const { merchantReference, amount, customerName, customerEmail, customerPhone, subject } = req.body;
      if (!merchantReference || !amount || !customerName || !customerEmail) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Get customer IP from request
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
    try {
      const body = req.body as Record<string, string>;
      console.log("[PaymentAsia] Callback received:", JSON.stringify(body));

      // Verify signature (optional but recommended)
      // const valid = verifyCallbackSignature(body);

      const { merchant_reference, status, amount, currency } = body;
      const isPaid = status === "paid" || status === "success" || status === "SUCCESS" || status === "PAID";

      if (isPaid && merchant_reference) {
        console.log(`[PaymentAsia] Payment confirmed: ${merchant_reference} HKD ${amount}`);
        // Here you could update order status, trigger Xero invoice, etc.
      }

      res.json({ status: "ok" });
    } catch (err) {
      res.status(500).json({ error: "Callback processing failed" });
    }
  });

  // Return URL after payment (GET — redirect customer back to site)
  app.get("/api/payment/return", (req, res) => {
    const ref = req.query.ref as string;
    res.redirect(`/#/payment-result?ref=${ref || ""}`);
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
  app.get("/api/xero/callback", async (req, res) => {
    try {
      const tokenSet = await xero.apiCallback(req.url);
      await xero.updateTenants();
      const tenantId = xero.tenants[0]?.tenantId;
      if (!tenantId) throw new Error("No Xero tenant found");
      setXeroTokens(tokenSet, tenantId);
      console.log(`[Xero] Connected! Tenant: ${xero.tenants[0]?.tenantName}`);
      res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:60px">
        <h2>✅ Xero Connected!</h2>
        <p>Terroir & Craft is now connected to Xero.</p>
        <p>Tenant: <strong>${xero.tenants[0]?.tenantName}</strong></p>
        <p><a href="/#/">Return to website</a></p>
      </body></html>`);
    } catch (err) {
      console.error("[Xero] Callback error:", err);
      res.status(500).send("Xero connection failed. Please try again.");
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

  return httpServer;
}
