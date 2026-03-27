import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@terroirandcraft.online";
const SITE_NAME = "Terroir & Craft 天地人酒業";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) resend = new Resend(RESEND_API_KEY);
  return resend;
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
