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
const STOCK_SHEET_ID = "1k5mUs69iPYHSi6WoeVD1hrls4dnlI-yMBRIOIq8dRVg";
const STOCK_SHEET_TAB = "Item Master"; // A=Item Code, W=總庫存
const MEMBERS_SHEET_ID = "1knojavzlakQAQjPLMhhAwpPNsUhuSkhISVYEyIOpD_U";
const MEMBERS_SHEET_TAB = "工作表1";

// ── Stock cache (2 minutes — short enough to catch recent changes) ─────────
let stockCache: Record<string, number> = {};
let stockCacheTime = 0;
let stockRowIndex: Record<string, number> = {}; // itemCode → row number (1-based)
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

export async function getStockMap(forceRefresh = false): Promise<Record<string, number>> {
  const now = Date.now();
  if (!forceRefresh && now - stockCacheTime < CACHE_TTL_MS && Object.keys(stockCache).length > 0) {
    return stockCache;
  }

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: STOCK_SHEET_ID,
      range: `${STOCK_SHEET_TAB}!A:W`,
    });

    const rows = res.data.values || [];
    const map: Record<string, number> = {};
    const rowIdx: Record<string, number> = {};

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const itemCode = row[0]?.toString().trim();
      const stockRaw = row[22]; // Column W = index 22
      if (itemCode) {
        const stock = stockRaw !== undefined && stockRaw !== "" ? Number(stockRaw) : 999;
        map[itemCode] = isNaN(stock) ? 999 : stock;
        rowIdx[itemCode] = i + 1; // Sheets rows are 1-based, +1 for header row
      }
    }

    stockCache = map;
    stockRowIndex = rowIdx;
    stockCacheTime = now;
    console.log(`[Sheets] Stock cache updated: ${Object.keys(map).length} items`);
    return map;
  } catch (err) {
    console.error("[Sheets] Failed to fetch stock:", err);
    return stockCache;
  }
}

export function getStockStatus(stock: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (stock <= 0) return "out_of_stock";
  if (stock <= 3) return "low_stock";
  return "in_stock";
}

// ── Check if items are available (for checkout validation) ─────────────────
export async function checkStockAvailability(
  items: Array<{ itemCode: string; quantity: number; name: string }>
): Promise<{ ok: boolean; issues: string[] }> {
  const stockMap = await getStockMap(true); // Always fresh check at checkout
  const issues: string[] = [];

  for (const item of items) {
    const stock = stockMap[item.itemCode];
    if (stock === undefined) continue; // Item not tracked in sheet — allow
    if (stock < item.quantity) {
      if (stock === 0) {
        issues.push(`${item.name} is out of stock`);
      } else {
        issues.push(`${item.name}: only ${stock} available (requested ${item.quantity})`);
      }
    }
  }

  return { ok: issues.length === 0, issues };
}

// ── Deduct stock after confirmed payment ───────────────────────────────────
export async function deductStock(
  items: Array<{ itemCode: string; quantity: number }>
): Promise<void> {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // Refresh cache to get latest row indices
    await getStockMap(true);

    const requests = [];
    for (const item of items) {
      const rowNum = stockRowIndex[item.itemCode];
      const currentStock = stockCache[item.itemCode];

      if (rowNum === undefined || currentStock === undefined || currentStock >= 999) {
        console.log(`[Sheets] Skipping stock deduct for ${item.itemCode} (not tracked)`);
        continue;
      }

      const newStock = Math.max(0, currentStock - item.quantity);

      requests.push(
        sheets.spreadsheets.values.update({
          spreadsheetId: STOCK_SHEET_ID,
          range: `${STOCK_SHEET_TAB}!W${rowNum}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [[newStock]] },
        })
      );

      // Update local cache immediately
      stockCache[item.itemCode] = newStock;
      console.log(`[Sheets] Stock deducted: ${item.itemCode} ${currentStock} → ${newStock}`);
    }

    await Promise.all(requests);
    // Invalidate cache so next read gets fresh data
    stockCacheTime = 0;
  } catch (err) {
    console.error("[Sheets] Failed to deduct stock:", err);
    // Non-blocking — don't fail the order
  }
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
          now, data.name, data.email, data.phone || "",
          data.points, data.source, "",
        ]],
      },
    });
    console.log(`[Sheets] New member appended: ${data.email}`);
  } catch (err) {
    console.error("[Sheets] Failed to append member:", err);
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
        requestBody: { values: [["登記日期", "姓名", "Email", "電話", "積分", "來源", "備註"]] },
      });
    }
  } catch (err) {
    console.error("[Sheets] Failed to init members sheet:", err);
  }
}
