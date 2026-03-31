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

  const ADMIN_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "info@terroirandcraft.com";
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
    `<tr><td style="padding:6px 12px;border-bottom:1px solid #f0ebe4">${i.name}</td><td style="padding:6px 12px;border-bottom:1px solid #f0ebe4;text-align:center">${i.quantity}</td><td style="padding:6px 12px;border-bottom:1px solid #f0ebe4;text-align:right">HK$${i.unitPrice * i.quantity}</td></tr>`
  ).join("");

  const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f8f5f0;padding:32px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
  <div style="background:#7a1e2e;color:#fff;padding:32px 40px;text-align:center">
    <p style="margin:0;opacity:.6;font-size:11px;letter-spacing:3px;text-transform:uppercase">Order Confirmed</p>
    <h1 style="margin:8px 0 0;font-weight:300;font-size:26px">多謝您的訂購 🎉</h1>
    <p style="margin:4px 0 0;opacity:.7;font-size:13px">Thank you for your order</p>
  </div>
  <div style="padding:32px 40px">
    <p style="margin:0 0 16px;color:#333">Hi ${customerName},</p>
    <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.6">We have received your payment. Your order is being prepared and we will contact you shortly to arrange delivery.</p>
    <div style="background:#f8f5f0;border-radius:8px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0 0 4px;color:#888;font-size:11px">訂單編號 ORDER REFERENCE</p>
      <p style="margin:0;font-weight:600;font-size:18px;color:#7a1e2e">${orderRef}</p>
      <p style="margin:8px 0 0;font-weight:600;color:#333">Total Paid: HK$${amountPaid}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px">
      <thead><tr style="background:#f8f5f0"><th style="padding:8px 12px;text-align:left">Item</th><th style="padding:8px 12px;text-align:center">Qty</th><th style="padding:8px 12px;text-align:right">Amount</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <p style="margin:0;color:#555;font-size:13px;line-height:1.6">An official invoice will also be sent to this email from Xero. If you have any questions, please contact us at <a href="mailto:info@terroirandcraft.com" style="color:#7a1e2e">info@terroirandcraft.com</a> or call <strong>+852 2981 8868</strong>.</p>
  </div>
  <div style="padding:16px 40px;background:#f8f5f0;font-size:11px;color:#999;text-align:center">
    天地人酒業 Terroir & Craft Co., Ltd<br>Room 509, 5/F, Seaview Centre, 139 Hoi Bun Road, Kwun Tong
  </div>
</div>
</body></html>`;

  try {
    await getResend().emails.send({
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to: [customerEmail],
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
