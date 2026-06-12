import { Router, Request, Response } from "express"
import nodemailer from "nodemailer"

const router = Router()

// POST /api/contact
router.post("/", async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: "All fields are required." })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email address." })
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f3f4f6; margin:0; padding:0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6; padding:40px 20px;">
          <tr><td align="center">
            <table width="100%" style="max-width:600px;">
              <tr><td style="background:#111111; padding:30px; border-radius:16px 16px 0 0; text-align:center;">
                <h1 style="color:white; margin:0; font-size:28px; font-weight:900;">FACT<span style="color:#ff3040;">FLOW</span></h1>
                <p style="color:#9ca3af; margin:8px 0 0; font-size:14px;">New Contact Form Submission</p>
              </td></tr>
              <tr><td style="background:#ffffff; padding:40px 30px; border-radius:0 0 16px 16px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding-bottom:20px; border-bottom:1px solid #eaeaea;">
                    <p style="margin:0 0 4px; color:#6b7280; font-size:13px; text-transform:uppercase; font-weight:600;">From</p>
                    <p style="margin:0; color:#111827; font-size:16px; font-weight:600;">${name}</p>
                    <a href="mailto:${email}" style="color:#3b82f6; font-size:14px;">${email}</a>
                  </td></tr>
                  <tr><td style="padding:20px 0; border-bottom:1px solid #eaeaea;">
                    <p style="margin:0 0 4px; color:#6b7280; font-size:13px; text-transform:uppercase; font-weight:600;">Subject</p>
                    <p style="margin:0; color:#111827; font-size:16px;">${subject}</p>
                  </td></tr>
                  <tr><td style="padding-top:20px;">
                    <p style="margin:0 0 8px; color:#6b7280; font-size:13px; text-transform:uppercase; font-weight:600;">Message</p>
                    <p style="margin:0; color:#374151; font-size:15px; line-height:1.7;">${message.replace(/\n/g, "<br>")}</p>
                  </td></tr>
                </table>
                <div style="margin-top:32px; padding-top:24px; border-top:1px solid #eaeaea; text-align:center;">
                  <a href="mailto:${email}" style="display:inline-block; background:#ff3040; color:white; text-decoration:none; padding:10px 24px; border-radius:8px; font-weight:600; font-size:14px;">Reply to ${name}</a>
                </div>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `

    // Send email to your team inbox
    await transporter.sendMail({
      from: `"Fact Flow Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER || "factflow1819@gmail.com",
      replyTo: email,
      subject: `[Contact Form] ${subject} — from ${name}`,
      html,
    })

    // Send auto-reply confirmation to the user
    await transporter.sendMail({
      from: `"Fact Flow" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "We received your message — Fact Flow",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#f3f4f6; margin:0; padding:0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6; padding:40px 20px;">
            <tr><td align="center">
              <table width="100%" style="max-width:600px;">
                <tr><td style="background:#111111; padding:30px; border-radius:16px 16px 0 0; text-align:center;">
                  <h1 style="color:white; margin:0; font-size:28px; font-weight:900;">FACT<span style="color:#ff3040;">FLOW</span></h1>
                </td></tr>
                <tr><td style="background:#ffffff; padding:40px 30px; border-radius:0 0 16px 16px; text-align:center;">
                  <h2 style="color:#111827; margin:0 0 16px;">Thanks for reaching out, ${name}!</h2>
                  <p style="color:#4b5563; font-size:15px; line-height:1.7;">We've received your message and will get back to you as soon as possible, typically within 24-48 hours.</p>
                  <p style="color:#9ca3af; font-size:13px; margin-top:32px;">Fact Flow Team — factflow1819@gmail.com</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    })

    return res.json({ success: true, message: "Message sent successfully!" })
  } catch (err: any) {
    console.error("❌ Contact form email error:", err.message)
    return res.status(500).json({ success: false, message: "Failed to send message. Please try again." })
  }
})

export default router
