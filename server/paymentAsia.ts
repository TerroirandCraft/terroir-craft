import crypto from "crypto";

// ── Payment Asia credentials ──────────────────────────────────────────────
const PA_MERCHANT_TOKEN = process.env.PA_MERCHANT_TOKEN || "1c650466-5b69-4c18-8a13-a86aa29744c0";
const PA_MERCHANT_SECRET = process.env.PA_MERCHANT_SECRET || "1c6c6b0e-d920-47a0-b468-a5e767ca39fd";
const PA_API_KEY = process.env.PA_API_KEY || "8df2a7ea-c96a-41cc-9938-a041926ccff4";
const PA_LIVE_URL = "https://gateway.pa-sys.com/payment/v3/request";
const BASE_URL = process.env.BASE_URL || "https://terroir-craft-production.up.railway.app";

// ── Signature: HMAC-SHA256 of sorted key=value pairs using Merchant Secret ──
function buildSignature(params: Record<string, string>): string {
  // Sort keys alphabetically, build query string, sign with merchant secret
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join("&");
  return crypto
    .createHmac("sha256", PA_MERCHANT_SECRET)
    .update(sorted)
    .digest("hex");
}

export interface PaymentRequest {
  merchantReference: string;   // our order ID
  amount: number;               // HKD amount (e.g. 1050.00)
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;              // order description
  referredBy?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  merchantReference?: string;
  error?: string;
}

export async function createPayment(req: PaymentRequest): Promise<PaymentResponse> {
  const params: Record<string, string> = {
    merchant_reference: req.merchantReference,
    currency: "HKD",
    amount: req.amount.toFixed(2),
    customer_first_name: req.customerName.split(" ")[0] || req.customerName,
    customer_last_name: req.customerName.split(" ").slice(1).join(" ") || req.customerName,
    customer_email: req.customerEmail,
    customer_phone: req.customerPhone || "",
    customer_country: "HK",
    subject: req.subject.substring(0, 64),
    // All supported networks — PA page lets customer choose
    network: "Alipay,WeChatPay,FPS,CreditCard,Octopus,PayMe",
    return_url: `${BASE_URL}/api/payment/return?ref=${req.merchantReference}`,
    notify_url: `${BASE_URL}/api/payment/callback`,
    type: "Sale",
  };

  // Add signature
  params.signature = buildSignature(params);

  try {
    const response = await fetch(PA_LIVE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "merchant-token": PA_MERCHANT_TOKEN,
        "api-key": PA_API_KEY,
      },
      body: JSON.stringify(params),
    });

    const data = await response.json() as any;
    console.log("[PaymentAsia] Create payment response:", JSON.stringify(data));

    if (data?.response?.code === "200" || data?.payload?.payment_url) {
      return {
        success: true,
        paymentUrl: data.payload?.payment_url,
        merchantReference: data.payload?.merchant_reference,
      };
    } else {
      return {
        success: false,
        error: data?.response?.message || "Payment creation failed",
      };
    }
  } catch (err: any) {
    console.error("[PaymentAsia] Error:", err);
    return { success: false, error: err.message };
  }
}

// ── Verify callback signature ─────────────────────────────────────────────
export function verifyCallbackSignature(body: Record<string, string>): boolean {
  const receivedSig = body.signature;
  if (!receivedSig) return false;
  const { signature: _, ...rest } = body;
  const expected = buildSignature(rest);
  return expected === receivedSig;
}
