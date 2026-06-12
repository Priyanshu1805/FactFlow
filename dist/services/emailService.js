"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDigestEmail = sendDigestEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
function generateEmailHTML(title, subtitle, articles) {
    const articleCards = articles.map(article => `
    <div style="background: #ffffff; border-radius: 12px; overflow: hidden; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eaeaea;">
      ${article.image ? `<img src="${article.image}" alt="${article.title}" style="width: 100%; height: 200px; object-fit: cover; display: block;" />` : ''}
      <div style="padding: 20px;">
        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <span style="background: #f0f4ff; color: #3b82f6; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">${article.category}</span>
          ${article.isBreaking ? `<span style="background: #fef2f2; color: #ef4444; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">Breaking</span>` : ''}
        </div>
        <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #111827; line-height: 1.4;">
          <a href="${process.env.FRONTEND_URL}/newspaper/${article.slug || article._id}" style="color: #111827; text-decoration: none;">${article.title}</a>
        </h2>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">${article.excerpt}</p>
        <a href="${process.env.FRONTEND_URL}/newspaper/${article.slug || article._id}" style="display: inline-block; background: #ff3040; color: white; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: bold;">Read Full Story →</a>
      </div>
    </div>
  `).join("");
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
              <!-- Header -->
              <tr>
                <td style="background: #111111; padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">FACT<span style="color: #ff3040;">FLOW</span></h1>
                  <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 14px;">${subtitle}</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px;">
                  <h2 style="margin: 0 0 24px 0; color: #111827; font-size: 22px;">${title}</h2>
                  ${articleCards}
                  
                  <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #eaeaea;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 12px 0;">You received this email because you subscribed to FactFlow digests.</p>
                    <a href="${process.env.FRONTEND_URL}/settings" style="color: #3b82f6; text-decoration: none; font-size: 14px;">Manage Notifications</a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
async function sendDigestEmail(toEmail, type, articles) {
    if (!articles || articles.length === 0)
        return false;
    const subject = type === "daily"
        ? "📰 FactFlow Daily Digest: Today's Top Stories"
        : "🗞️ FactFlow Weekly Summary: The Week in Review";
    const title = type === "daily" ? "Today's Top Stories" : "The Week in Review";
    const subtitle = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const html = generateEmailHTML(title, subtitle, articles);
    try {
        await transporter.sendMail({
            from: '"Fact Flow" <' + process.env.SMTP_USER + '>',
            to: toEmail,
            subject,
            html,
        });
        return true;
    }
    catch (err) {
        console.error("❌ Email send failed:", err.message);
        return false;
    }
}
//# sourceMappingURL=emailService.js.map