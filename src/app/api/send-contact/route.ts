import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const recipient = process.env.REPORT_RECIPIENT || 'agrilinklanka@gmail.com';

  if (!gmailUser || !gmailPass || gmailPass === 'your_16_char_app_password_here') {
    return NextResponse.json(
      { error: 'Email not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local.' },
      { status: 503 }
    );
  }

  let data: { name: string; email: string; subject: string; message: string };
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!data.name || !data.email || !data.subject || !data.message) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: gmailUser, pass: gmailPass },
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
    <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">🌿 AgriLink Lanka — Contact Form</h1>
    </div>
    <div style="padding:24px 32px;">
      <p style="margin:0 0 16px;font-size:14px;color:#6b7280;">A new message was submitted via the Contact Us page.</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 0;font-weight:600;color:#374151;width:100px;">Name</td>
          <td style="padding:10px 0;color:#111827;">${data.name}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 0;font-weight:600;color:#374151;">Email</td>
          <td style="padding:10px 0;color:#111827;"><a href="mailto:${data.email}" style="color:#16a34a;">${data.email}</a></td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:10px 0;font-weight:600;color:#374151;">Subject</td>
          <td style="padding:10px 0;color:#111827;">${data.subject}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;font-weight:600;color:#374151;vertical-align:top;">Message</td>
          <td style="padding:10px 0;color:#111827;white-space:pre-wrap;">${data.message}</td>
        </tr>
      </table>
    </div>
    <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} AgriLink Lanka</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"AgriLink Lanka" <${gmailUser}>`,
      to: recipient,
      replyTo: data.email,
      subject: `[Contact Form] ${data.subject} — from ${data.name}`,
      text: `Name: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}\n\n${data.message}`,
      html,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Contact email send error:', message);
    return NextResponse.json({ error: `Failed to send email: ${message}` }, { status: 500 });
  }
}
