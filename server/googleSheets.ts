import { google } from "googleapis";

// ── Credentials from environment variable ─────────────────────────────────
function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON env var not set");
  const creds = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });
}

// ── Sheet IDs ──────────────────────────────────────────────────────────────
const STOCK_SHEET_ID = "1Adm-64W56duFkxu6261_JEk2moXUOfqd";
const STOCK_SHEET_TAB = "Item master"; // gid=112811888
const MEMBERS_SHEET_ID = "1knojavzlakQAQjPLMhhAwpPNsUhuSkhISVYEyIOpD_U";
const MEMBERS_SHEET_TAB = "工作表1";

// ── Stock cache (15 minutes) ───────────────────────────────────────────────
let stockCache: Record<string, number> = {};
let stockCacheTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000;

export async function getStockMap(): Promise<Record<string, number>> {
  const now = Date.now();
  if (now - stockCacheTime < CACHE_TTL_MS && Object.keys(stockCache).length > 0) {
    return stockCache;
  }

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // Read columns A (item code) and W (stock) — rows 2 onwards
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: STOCK_SHEET_ID,
      range: `${STOCK_SHEET_TAB}!A:W`,
    });

    const rows = res.data.values || [];
    const map: Record<string, number> = {};

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const itemCode = row[0]?.toString().trim();
      const stockRaw = row[22]; // Column W = index 22
      if (itemCode) {
        const stock = stockRaw !== undefined && stockRaw !== "" ? Number(stockRaw) : 999;
        map[itemCode] = isNaN(stock) ? 999 : stock;
      }
    }

    stockCache = map;
    stockCacheTime = now;
    console.log(`[Sheets] Stock cache updated: ${Object.keys(map).length} items`);
    return map;
  } catch (err) {
    console.error("[Sheets] Failed to fetch stock:", err);
    return stockCache; // Return stale cache on error
  }
}

export function getStockStatus(stock: number): "in_stock" | "out_of_stock" {
  return stock > 0 ? "in_stock" : "out_of_stock";
}

// ── Write new member to TC Website Members sheet ───────────────────────────
export async function appendMember(data: {
  name: string;
  email: string;
  phone?: string;
  points: number;
  source: string;
}) {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const now = new Date().toLocaleString("zh-HK", { timeZone: "Asia/Hong_Kong" });

    await sheets.spreadsheets.values.append({
      spreadsheetId: MEMBERS_SHEET_ID,
      range: `${MEMBERS_SHEET_TAB}!A:G`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          now,                    // A: 登記日期
          data.name,              // B: 姓名
          data.email,             // C: Email
          data.phone || "",       // D: 電話
          data.points,            // E: 積分
          data.source,            // F: 來源
          "",                     // G: 備註
        ]],
      },
    });

    console.log(`[Sheets] New member appended: ${data.email}`);
  } catch (err) {
    console.error("[Sheets] Failed to append member:", err);
    // Don't throw — member registration should still succeed even if Sheets fails
  }
}

// ── Initialise Members sheet headers if empty ──────────────────────────────
export async function initMembersSheet() {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: MEMBERS_SHEET_ID,
      range: `${MEMBERS_SHEET_TAB}!A1:G1`,
    });

    const firstRow = res.data.values?.[0];
    if (!firstRow || firstRow[0] !== "登記日期") {
      await sheets.spreadsheets.values.update({
        spreadsheetId: MEMBERS_SHEET_ID,
        range: `${MEMBERS_SHEET_TAB}!A1:G1`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["登記日期", "姓名", "Email", "電話", "積分", "來源", "備註"]],
        },
      });
      console.log("[Sheets] Members sheet headers initialised");
    }
  } catch (err) {
    console.error("[Sheets] Failed to init members sheet:", err);
  }
}
