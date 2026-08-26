import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL ?? "";
const NOTIFY_EMAIL = "partnerships@mborewards.com";
const FROM_EMAIL = "MBO Rewards <partnerships@mborewards.com>";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const body = await req.json();
  const { name, email, mobile, company, website, jobtitle, country, platform, mau, source, timeline, message } = body;

  if (!name || !email || !mobile || !company || !website || !jobtitle || !country || !platform || !mau) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  const timestamp = new Date().toISOString();
  const errors: string[] = [];

  // 1. Append row to Google Sheet via Apps Script webhook
  if (SHEET_WEBHOOK_URL) {
    try {
      await fetch(SHEET_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp, name, jobtitle, email, mobile, company, website, country, platform, mau, source, timeline, message }),
      });
    } catch {
      errors.push("sheet");
    }
  }

  // 2. Thank-you email to submitter
  try {
    const r1 = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "We've received your request — MBO Rewards",
      html: thankYouHtml(name),
    });
    if (r1.error) {
      console.error("Resend thank-you error:", JSON.stringify(r1.error));
      errors.push("thank-you-email");
    }
  } catch (err) {
    console.error("Resend thank-you exception:", err);
    errors.push("thank-you-email");
  }

  // 3. Internal notification email
  try {
    const r2 = await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      subject: `New demo request — ${name} from ${company || "unknown"}`,
      html: notifyHtml({ timestamp, name, jobtitle, email, mobile, company, website, country, platform, mau, source, timeline, message }),
    });
    if (r2.error) {
      console.error("Resend notify error:", JSON.stringify(r2.error));
      errors.push("notify-email");
    }
  } catch (err) {
    console.error("Resend notify exception:", err);
    errors.push("notify-email");
  }

  if (errors.length === 3) {
    return NextResponse.json({ error: "Submission failed. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

function thankYouHtml(name: string) {
  return `<!DOCTYPE html>
<html>
<body style="font-family:Inter,sans-serif;background:#f8f9fc;margin:0;padding:40px 16px;">
  <div style="max-width:540px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #edf0f7;">
    <div style="background:linear-gradient(160deg,#060d1f,#1a3070);padding:32px 40px;">
      <img src="https://mborewards.com/logos/mbo-logo-email.png" alt="MBO Rewards" style="height:56px;width:auto;display:block;margin-bottom:28px;" />
      <h1 style="font-size:22px;font-weight:800;color:#ffffff;margin:0;line-height:1.3;">We've received your request, ${name}.</h1>
    </div>
    <div style="padding:36px 40px;">
      <p style="font-size:15px;color:#475569;line-height:1.75;margin:0 0 24px;">
        Thanks for reaching out. Our integration team will review your submission and be in touch within one business day to schedule a scoping call.
      </p>
      <p style="font-size:14px;font-weight:700;color:#0d1b3e;margin:0 0 16px;">What happens next:</p>
      <table style="width:100%;border-collapse:collapse;">
        ${[
          ["1", "We review your platform", "Within one business day, our integration team reviews your submission."],
          ["2", "Scoping call (30 min)", "We walk through your platform type, user model, and technical stack."],
          ["3", "API credentials + sandbox", "You receive sandbox credentials and a dedicated integration engineer."],
          ["4", "Go live", "Most integrations complete in 2–3 days."],
        ].map(([n, title, body]) => `
        <tr>
          <td style="padding:14px 0;vertical-align:top;width:36px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:28px;height:28px;border-radius:50%;background:#c9a227;text-align:center;vertical-align:middle;font-size:11px;font-weight:800;color:#0d1b3e;line-height:28px;">${n}</td>
              </tr>
            </table>
          </td>
          <td style="padding:14px 0 14px 14px;vertical-align:top;border-bottom:1px solid #f0f4fa;">
            <p style="font-size:13px;font-weight:700;color:#0d1b3e;margin:0 0 4px;">${title}</p>
            <p style="font-size:12.5px;color:#64748b;margin:0;line-height:1.6;">${body}</p>
          </td>
        </tr>`).join("")}
      </table>
      <p style="font-size:13px;color:#94a3b8;margin:28px 0 0;">Questions in the meantime? Reply to this email or reach us at <a href="mailto:partnerships@mborewards.com" style="color:#c9a227;text-decoration:none;">partnerships@mborewards.com</a></p>
    </div>
    <div style="padding:20px 40px;border-top:1px solid #f0f4fa;background:#fafbff;">
      <p style="font-size:11px;color:#94a3b8;margin:0;">MBO Rewards — Affiliate Commerce Infrastructure API · <a href="https://mborewards.com" style="color:#94a3b8;">mborewards.com</a></p>
    </div>
  </div>
</body>
</html>`;
}

function notifyHtml(data: Record<string, string>) {
  const rows = [
    ["Name", data.name],
    ["Job title", data.jobtitle],
    ["Email", data.email],
    ["Mobile", data.mobile],
    ["Company", data.company],
    ["Website", data.website],
    ["Country", data.country],
    ["Platform type", data.platform],
    ["Monthly active users", data.mau],
    ["How they heard", data.source || "—"],
    ["Expected go-live", data.timeline || "—"],
    ["Message", data.message || "—"],
    ["Submitted at", data.timestamp],
  ];
  return `<!DOCTYPE html>
<html>
<body style="font-family:Inter,sans-serif;background:#f8f9fc;margin:0;padding:40px 16px;">
  <div style="max-width:540px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #edf0f7;">
    <div style="background:#0d1b3e;padding:28px 32px;">
      <img src="https://mborewards.com/logos/mbo-logo-email.png" alt="MBO Rewards" style="height:32px;width:auto;display:block;margin-bottom:16px;" />
      <p style="font-size:12px;font-weight:700;color:#c9a227;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px;">New demo request</p>
      <h1 style="font-size:18px;font-weight:800;color:#ffffff;margin:0;">${data.name} · ${data.company || "—"}</h1>
    </div>
    <div style="padding:28px 32px;">
      <table style="width:100%;border-collapse:collapse;">
        ${rows.map(([label, val]) => `
        <tr style="border-bottom:1px solid #f0f4fa;">
          <td style="padding:10px 0;font-size:12px;font-weight:700;color:#94a3b8;width:140px;vertical-align:top;">${label}</td>
          <td style="padding:10px 0;font-size:13px;color:#0d1b3e;vertical-align:top;">${val || "—"}</td>
        </tr>`).join("")}
      </table>
    </div>
  </div>
</body>
</html>`;
}
