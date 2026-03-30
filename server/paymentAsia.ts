import crypto from "crypto";

// ── Payment Asia credentials ──────────────────────────────────────────────────
const PA_MERCHANT_TOKEN = process.env.PA_MERCHANT_TOKEN || "1c650466-5b69-4c18-8a13-a86aa29744c0";
const PA_MERCHANT_SECRET = process.env.PA_MERCHANT_SECRET || "1c6c6b0e-d920-47a0-b468-a5e767ca39fd";

const PA_GATEWAY_BASE = "https://payment.pa-sys.com/app/page";
const BASE_URL = process.env.BASE_URL || "https://terroir-craft-production.up.railway.app";

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
// Matches PHP: hash('SHA512', http_build_query($fields) . $secret)
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
  htmlForm?: string;
  paymentUrl?: string;
  error?: string;
}

export function createPaymentForm(req: PaymentRequest): PaymentResponse {
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

  // Generate signature (before adding sign field)
  fields.sign = buildSignature(fields);

  // Generic gateway URL: /generic/[Merchant Token]
  const actionUrl = `${PA_GATEWAY_BASE}/generic/${PA_MERCHANT_TOKEN}`;

  const hiddenInputs = Object.entries(fields)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${v.replace(/"/g, "&quot;")}" />`)
    .join("\n    ");

  const htmlForm = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Redirecting to secure payment...</title>
  <style>body{font-family:sans-serif;text-align:center;padding:3rem;color:#333;}</style>
</head>
<body onload="document.forms['payment'].submit();">
  <p>Redirecting to secure payment page...</p>
  <p style="font-size:0.875rem;color:#999;">Please do not close this window.</p>
  <form method="POST" action="${actionUrl}" name="payment" accept-charset="utf-8">
    ${hiddenInputs}
  </form>
</body>
</html>`;

  console.log("[PaymentAsia] Form created:", req.merchantReference, "→", actionUrl);
  return { success: true, htmlForm, paymentUrl: actionUrl };
}

// ── Verify callback signature from Payment Asia datafeed ──────────────────────
export function verifyCallbackSignature(body: Record<string, string>): boolean {
  const receivedSign = body.sign;
  if (!receivedSign) return false;
  const { sign: _, ...rest } = body;
  return buildSignature(rest) === receivedSign;
}
