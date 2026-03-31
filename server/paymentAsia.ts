import crypto from "crypto";

// ── Payment Asia credentials ──────────────────────────────────────────────────
const PA_MERCHANT_TOKEN = process.env.PA_MERCHANT_TOKEN || "1c650466-5b69-4c18-8a13-a86aa29744c0";
const PA_MERCHANT_SECRET = process.env.PA_MERCHANT_SECRET || "1c6c6b0e-d920-47a0-b468-a5e767ca39fd";

// Toggle: set PA_SANDBOX=true in Railway env to use sandbox
const PA_SANDBOX = process.env.PA_SANDBOX === "true";
const PA_GATEWAY_BASE = PA_SANDBOX
  ? "https://payment-sandbox.pa-sys.com/app/page"
  : "https://payment.pa-sys.com/app/page";
// Always use www. — apex domain (no www) has no Railway DNS record
const RAW_BASE_URL = process.env.BASE_URL || "https://terroir-craft-production.up.railway.app";
const BASE_URL = RAW_BASE_URL.replace("://terroirandcraft.online", "://www.terroirandcraft.online");

// ── PHP-compatible urlencode: spaces become +, like PHP's urlencode() ─────────
function phpEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/%20/g, "+")
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A");
}

// ── Signature: SHA-512 of http_build_query(sorted fields) + secret ────────────
function buildSignature(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${phpEncode(k)}=${phpEncode(params[k])}`)
    .join("&");
  return crypto.createHash("sha512").update(sorted + PA_MERCHANT_SECRET).digest("hex");
}

export interface PaymentRequest {
  merchantReference: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerIp?: string;
  subject: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  error?: string;
}

export async function createPayment(req: PaymentRequest): Promise<PaymentResponse> {
  const firstName = req.customerName.split(" ")[0] || req.customerName;
  const lastName = req.customerName.split(" ").slice(1).join(" ") || req.customerName;

  const fields: Record<string, string> = {
    merchant_reference: req.merchantReference,
    currency: "HKD",
    amount: req.amount.toFixed(2),
    customer_ip: req.customerIp || "127.0.0.1",
    customer_first_name: firstName,
    customer_last_name: lastName,
    customer_phone: req.customerPhone || "00000000",
    customer_email: req.customerEmail,
    customer_state: "HK",
    customer_country: "HK",
    return_url: `${BASE_URL}/api/payment/return?ref=${req.merchantReference}`,
    notify_url: `${BASE_URL}/api/payment/callback`,
    network: "UserDefine", // Generic gateway — customer picks payment method
    subject: req.subject.substring(0, 255),
  };

  fields.sign = buildSignature(fields);

  const actionUrl = `${PA_GATEWAY_BASE}/generic/${PA_MERCHANT_TOKEN}`;

  try {
    // POST form to Payment Asia — it returns 302 redirect to hosted payment page
    const params = new URLSearchParams(fields);
    const response = await fetch(actionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "text/html,application/json",
      },
      body: params.toString(),
      redirect: "manual", // Don't follow redirect — we want the Location header
    });

    console.log("[PaymentAsia] Response status:", response.status);

    if (response.status === 302) {
      // Get the redirect URL from Location header
      let location = response.headers.get("location") || "";

      // Fix protocol-relative URLs (//payment.pa-sys.com/...)
      if (location.startsWith("//")) {
        location = "https:" + location;
      }

      console.log("[PaymentAsia] Payment URL:", location);
      return { success: true, paymentUrl: location };
    }

    // Non-redirect response — check for error
    const text = await response.text();
    console.error("[PaymentAsia] Unexpected response:", response.status, text.substring(0, 200));
    return { success: false, error: `Unexpected response: ${response.status}` };

  } catch (err: any) {
    console.error("[PaymentAsia] Error:", err);
    return { success: false, error: err.message };
  }
}

// ── Verify callback signature from Payment Asia datafeed ──────────────────────
export function verifyCallbackSignature(body: Record<string, string>): boolean {
  const receivedSign = body.sign;
  if (!receivedSign) return false;
  const { sign: _, ...rest } = body;
  return buildSignature(rest) === receivedSign;
}
