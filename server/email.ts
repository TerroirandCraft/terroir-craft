import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@terroirandcraft.online";
const SITE_NAME = "Terroir & Craft 天地人酒業";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) resend = new Resend(RESEND_API_KEY);
  return resend;
}

// ── Order notification emails ────────────────────────────────────────────────

export async function sendOrderNotificationToAdmin(
  orderRef: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string | undefined,
  deliveryAddress: string | undefined,
  items: Array<{ name: string; itemCode: string; quantity: number; unitPrice: number }>,
  amountPaid: number,
  referredBy: string | undefined,
  isGift: boolean,
  recipientName: string | undefined,
): Promise<void> {
  if (!RESEND_API_KEY) return;

  const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "eshop@terroirandcraft.com";
  const itemRows = items.map(i =>
    `<tr><td style="padding:6px 12px;border-bottom:1px solid #f0ebe4">${i.itemCode}</td><td style="padding:6px 12px;border-bottom:1px solid #f0ebe4">${i.name}</td><td style="padding:6px 12px;border-bottom:1px solid #f0ebe4;text-align:center">${i.quantity}</td><td style="padding:6px 12px;border-bottom:1px solid #f0ebe4;text-align:right">HK$${i.unitPrice}</td></tr>`
  ).join("");

  const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f8f5f0;padding:32px">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
  <div style="background:#7a1e2e;color:#fff;padding:24px 32px">
    <h2 style="margin:0;font-weight:400">🛒 New Order Received</h2>
    <p style="margin:4px 0 0;opacity:.7;font-size:13px">${new Date().toLocaleString("zh-HK", { timeZone: "Asia/Hong_Kong" })} HKT</p>
  </div>
  <div style="padding:24px 32px">
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr><td style="color:#888;font-size:12px;padding:4px 0">Order Ref</td><td style="font-weight:600">${orderRef}</td></tr>
      <tr><td style="color:#888;font-size:12px;padding:4px 0">Customer</td><td>${customerName}</td></tr>
      <tr><td style="color:#888;font-size:12px;padding:4px 0">Email</td><td>${customerEmail}</td></tr>
      <tr><td style="color:#888;font-size:12px;padding:4px 0">Phone</td><td>${customerPhone || "—"}</td></tr>
      <tr><td style="color:#888;font-size:12px;padding:4px 0">Delivery</td><td>${deliveryAddress || "—"}</td></tr>
      ${isGift ? `<tr><td style="color:#888;font-size:12px;padding:4px 0">🎁 Gift to</td><td>${recipientName || "—"}</td></tr>` : ""}
      ${referredBy ? `<tr><td style="color:#888;font-size:12px;padding:4px 0">Referred by</td><td>${referredBy}</td></tr>` : ""}
      <tr><td style="color:#888;font-size:12px;padding:4px 0">Amount Paid</td><td style="font-weight:600;color:#7a1e2e">HK$${amountPaid}</td></tr>
    </table>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="background:#f8f5f0"><th style="padding:8px 12px;text-align:left">Code</th><th style="padding:8px 12px;text-align:left">Item</th><th style="padding:8px 12px;text-align:center">Qty</th><th style="padding:8px 12px;text-align:right">Price</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
  </div>
  <div style="padding:16px 32px;background:#f8f5f0;font-size:11px;color:#999;text-align:center">Terroir & Craft 天地人酒業 | Auto-notification</div>
</div>
</body></html>`;

  try {
    await getResend().emails.send({
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      subject: `🛒 New Order ${orderRef} — HK$${amountPaid} from ${customerName}`,
      html,
    });
    console.log(`[Email] Order notification sent to admin for ${orderRef}`);
  } catch (err) {
    console.error("[Email] Admin notification failed:", err);
  }
}

export async function sendOrderConfirmationToCustomer(
  orderRef: string,
  customerName: string,
  customerEmail: string,
  items: Array<{ name: string; itemCode: string; quantity: number; unitPrice: number }>,
  amountPaid: number,
): Promise<void> {
  if (!RESEND_API_KEY) return;

  const itemRows = items.map(i =>
    `<tr>
      <td style="padding:10px 16px;border-bottom:1px solid #f0ebe4;font-size:13px;color:#333">${i.name}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f0ebe4;text-align:center;font-size:13px;color:#555">${i.quantity}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f0ebe4;text-align:right;font-size:13px;font-weight:600;color:#333">HK$${(i.unitPrice * i.quantity).toLocaleString()}</td>
    </tr>`
  ).join("");

  const html = `<!DOCTYPE html>
<html lang="zh-HK">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f3ee;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ee;padding:40px 16px;">
  <tr><td align="center">
  <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:580px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#6b1a28 0%,#9a2035 100%);padding:36px 40px;text-align:center;">
        <p style="margin:0 0 6px;color:rgba(255,255,255,0.55);font-size:10px;letter-spacing:4px;text-transform:uppercase;">Terroir &amp; Craft 天地人酒業</p>
        <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:300;letter-spacing:1px;">訂單確認</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">Order Confirmation</p>
      </td>
    </tr>

    <!-- Order ref banner -->
    <tr>
      <td style="background:#fdf6ee;padding:20px 40px;border-bottom:1px solid #f0e8dc;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin:0 0 2px;color:#999;font-size:10px;letter-spacing:2px;text-transform:uppercase;">訂單編號 Order Ref</p>
              <p style="margin:0;color:#6b1a28;font-size:20px;font-weight:700;letter-spacing:1px;">${orderRef}</p>
            </td>
            <td style="text-align:right;">
              <p style="margin:0 0 2px;color:#999;font-size:10px;letter-spacing:2px;text-transform:uppercase;">合計 Total Paid</p>
              <p style="margin:0;color:#333;font-size:20px;font-weight:700;">HK$${amountPaid.toLocaleString()}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:32px 40px;">
        <p style="margin:0 0 8px;color:#1a1a1a;font-size:16px;font-weight:500;">Dear ${customerName},</p>
        <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.8;">
          感謝您的訂購！我們已成功收到您的付款，訂單正在處理中。<br>
          我們將盡快與您聯絡，安排送貨時間。<br>
          <span style="color:#888;font-size:13px;">Thank you for your order. We have received your payment and will contact you shortly to arrange delivery.</span>
        </p>

        <!-- Order items -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e8dc;border-radius:8px;overflow:hidden;margin-bottom:28px;">
          <thead>
            <tr style="background:#fdf6ee;">
              <th style="padding:10px 16px;text-align:left;font-size:11px;color:#999;font-weight:600;letter-spacing:1px;text-transform:uppercase;">商品 Item</th>
              <th style="padding:10px 16px;text-align:center;font-size:11px;color:#999;font-weight:600;letter-spacing:1px;text-transform:uppercase;">數量</th>
              <th style="padding:10px 16px;text-align:right;font-size:11px;color:#999;font-weight:600;letter-spacing:1px;text-transform:uppercase;">金額</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr style="background:#fdf6ee;">
              <td colspan="2" style="padding:12px 16px;font-size:13px;font-weight:600;color:#333;">合計 Total</td>
              <td style="padding:12px 16px;text-align:right;font-size:15px;font-weight:700;color:#6b1a28;">HK$${amountPaid.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Delivery note -->
        <div style="background:#f0f8f0;border-left:3px solid #4a8c5c;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:28px;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#2d5e3a;">📦 送貨安排 Delivery</p>
          <p style="margin:0;font-size:13px;color:#3d6b4a;line-height:1.7;">
            我們的團隊將於 1–3 個工作天內與您聯絡，確認送貨時間。<br>
            <span style="color:#5a8c6a;font-size:12px;">Our team will contact you within 1–3 business days to confirm your delivery slot.</span>
          </p>
        </div>

        <!-- Contact -->
        <div style="background:#fdf6ee;border-radius:8px;padding:20px 24px;">
          <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#333;">如有任何問題，請隨時聯絡我們：</p>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 16px 4px 0;">
                <a href="mailto:eshop@terroirandcraft.com" style="display:inline-flex;align-items:center;gap:6px;color:#6b1a28;text-decoration:none;font-size:13px;font-weight:500;">
                  📧 eshop@terroirandcraft.com
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 0;">
                <a href="https://wa.me/85298055609" style="display:inline-flex;align-items:center;gap:6px;color:#25a244;text-decoration:none;font-size:13px;font-weight:500;">
                  💬 WhatsApp: +852 9805 5609
                </a>
              </td>
            </tr>
          </table>
          <p style="margin:12px 0 0;font-size:12px;color:#888;">Monday – Saturday, 10am – 7pm HKT</p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px 40px;background:#f7f3ee;border-top:1px solid #ede5db;text-align:center;">
        <p style="margin:0 0 4px;color:#aaa;font-size:11px;">天地人酒業 Terroir &amp; Craft Co., Ltd</p>
        <p style="margin:0;color:#bbb;font-size:10px;">© 2025 Terroir &amp; Craft. All rights reserved.</p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body></html>`;

  try {
    await getResend().emails.send({
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to: [customerEmail],
      replyTo: "eshop@terroirandcraft.com",
      subject: `訂單確認 Order Confirmed — ${orderRef} | Terroir & Craft`,
      html,
    });
    console.log(`[Email] Order confirmation sent to ${customerEmail} for ${orderRef}`);
  } catch (err) {
    console.error("[Email] Customer confirmation failed:", err);
  }
}

export async function sendPasswordResetEmail(
  toEmail: string,
  toName: string,
  resetToken: string,
  baseUrl: string
): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not set — skipping email send. Token:", resetToken);
    return;
  }

  const resetUrl = `${baseUrl}/#/reset-password?token=${resetToken}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f8f5f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5f0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:560px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#7a1e2e;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:3px;text-transform:uppercase;">Member Club</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:300;letter-spacing:1px;">${SITE_NAME}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;color:#1a1a1a;font-size:20px;font-weight:500;">重設密碼 Reset Password</p>
              <p style="margin:0 0 24px;color:#666;font-size:14px;line-height:1.6;">
                Hi ${toName}，<br/>
                我們收到了你的重設密碼請求。請按下方按鈕重設你的密碼。<br/>
                <span style="color:#999;font-size:12px;">We received a request to reset your password. Click the button below to proceed.</span>
              </p>
              <p style="margin:0 0 12px;color:#999;font-size:12px;">此連結將於 <strong style="color:#1a1a1a;">1 小時</strong>後失效。</p>
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="background:#7a1e2e;border-radius:8px;">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:500;letter-spacing:0.5px;">
                      重設密碼 Reset Password →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#999;font-size:12px;">如果按鈕無效，請複製以下連結到瀏覽器：</p>
              <p style="margin:0;word-break:break-all;">
                <a href="${resetUrl}" style="color:#7a1e2e;font-size:12px;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f0ebe4;text-align:center;">
              <p style="margin:0;color:#bbb;font-size:11px;line-height:1.6;">
                如你並非申請重設密碼，請忽略此電郵。<br/>
                If you did not request this, please ignore this email.<br/>
                © 2026 Terroir & Craft Co., Ltd. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    const r = getResend();
    await r.emails.send({
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: "重設你的密碼 — Terroir & Craft",
      html,
    });
    console.log(`[Email] Password reset email sent to ${toEmail}`);
  } catch (err) {
    console.error("[Email] Failed to send reset email:", err);
    throw err;
  }
}
