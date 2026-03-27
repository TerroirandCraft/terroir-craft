import { pgTable, text, integer, real, serial, boolean, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  country: text("country").notNull(),
  region: text("region").notNull().default(""),
  type: text("type").notNull(),
  status: text("status").notNull(),
  size: text("size").notNull(),
  vintage: text("vintage").notNull().default(""),
  price: real("price").notNull().default(0),
  price_display: text("price_display").notNull().default(""),
  description: text("description").notNull().default(""),
  tasting_notes: text("tasting_notes").notNull().default(""),
  food_pairing: text("food_pairing").notNull().default(""),
  image_url: text("image_url").notNull().default(""),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  session_id: text("session_id").notNull(),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
});

// ─── Members ───────────────────────────────────────────────────────────────
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  password_hash: text("password_hash").notNull(), // bcrypt hash stored in memory
  points: integer("points").notNull().default(0),
  tier: text("tier").notNull().default("Silver"), // Silver / Gold / Platinum
  // Bonus flags (one-time actions)
  bonus_newsletter: boolean("bonus_newsletter").notNull().default(false),
  bonus_ig: boolean("bonus_ig").notNull().default(false),
  bonus_facebook: boolean("bonus_facebook").notNull().default(false),
  bonus_first_order: boolean("bonus_first_order").notNull().default(false),
  created_at: text("created_at").notNull().default(""),
  // Delivery info (updated at checkout)
  address: text("address").default(""),
  district: text("district").default(""),
});

// ─── Points Log ─────────────────────────────────────────────────────────────
export const pointsLog = pgTable("points_log", {
  id: serial("id").primaryKey(),
  member_id: integer("member_id").notNull(),
  delta: integer("delta").notNull(),          // +ve = earn, -ve = redeem
  reason: text("reason").notNull(),           // e.g. "Purchase HK$620", "Newsletter signup"
  created_at: text("created_at").notNull().default(""),
});

export const insertProductSchema = createInsertSchema(products);
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true });
export const insertMemberSchema = createInsertSchema(members).omit({ id: true });
export const insertPointsLogSchema = createInsertSchema(pointsLog).omit({ id: true });

// ─── Reset Tokens ────────────────────────────────────────────────────────────
export const resetTokens = pgTable("reset_tokens", {
  token: text("token").primaryKey(),
  member_id: integer("member_id").notNull(),
  expires_at: bigint("expires_at", { mode: "number" }).notNull(), // Unix ms
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type PointsLogEntry = typeof pointsLog.$inferSelect;
export type InsertPointsLogEntry = z.infer<typeof insertPointsLogSchema>;
