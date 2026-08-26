import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const NOTIFY_EMAIL = "partnerships@mborewards.com";
const FROM_EMAIL = "MBO Rewards <partnerships@mborewards.com>";
const SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL ?? "";

// Receives a simulator lead (before the business case PDF is generated).
//
// The webhook (sheet today, CRM tomorrow) is the source of truth for lead
// data — it receives the full structured payload and is awaited first.
// The email notification is a secondary, best-effort alert and is never
// allowed to affect the outcome.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, company, email, jobtitle, profile, estimates } = body;

  if (!name || !company || !email) {
    return NextResponse.json({ error: "Name, company, and work email are required." }, { status: 400 });
  }

  const lead = {
    source: "revenue-simulator",
    timestamp: new Date().toISOString(),
    name,
    company,
    email,
    jobtitle: jobtitle || "",
    ...profile, // businessType, country, mau, categories, weights, assumptions
    ...estimates, // conservative / expected / optimistic annual, monthly figures
  };

  // 1. Source of truth: structured webhook (sheet now, CRM later).
  let stored = false;
  if (SHEET_WEBHOOK_URL) {
    try {
      const res = await fetch(SHEET_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      stored = res.ok;
      if (!res.ok) console.error("Simulator lead webhook returned", res.status);
    } catch (err) {
      console.error("Simulator lead webhook error:", err);
    }
  }

  // 2. Secondary: best-effort email alert. Fire-and-forget — never blocks
  //    or fails the request.
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const rows = Object.entries(lead)
      .map(([k, v]) => `<tr><td style="padding:8px 12px;font-size:12px;color:#94a3b8;border-bottom:1px solid #f0f4fa;width:180px;">${k}</td><td style="padding:8px 12px;font-size:13px;color:#0d1b3e;border-bottom:1px solid #f0f4fa;">${Array.isArray(v) ? v.join(", ") : typeof v === "object" && v !== null ? JSON.stringify(v) : String(v)}</td></tr>`)
      .join("");
    resend.emails
      .send({
        from: FROM_EMAIL,
        to: NOTIFY_EMAIL,
        subject: `Simulator lead — ${name} from ${company}${stored ? "" : " (webhook failed — email is the only record)"}`,
        html: `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;"><h2 style="font-size:16px;color:#0d1b3e;">New Revenue Simulator lead</h2><p style="font-size:13px;color:#64748b;">Downloaded an executive business case with the following profile:</p><table style="width:100%;border-collapse:collapse;">${rows}</table></div>`,
      })
      .then(r => {
        if (r.error) console.error("Simulator lead email error:", JSON.stringify(r.error));
      })
      .catch(err => console.error("Simulator lead email exception:", err));
  }

  // The user's download is never blocked by logging outcomes.
  return NextResponse.json({ success: true, stored });
}
