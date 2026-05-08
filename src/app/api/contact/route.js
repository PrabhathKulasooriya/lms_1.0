import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 },
      );
    }

    await resend.emails.send({
      from: "NexLearn Contact <noreply@nexlearn.lk>",
      to: "info@nexlearn.lk",
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family:sans-serif;background:#f3f4f6;padding:32px;">
          <div style="max-width:520px;margin:auto;background:#fff;border-radius:16px;
                      overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:#0b408e;padding:24px 32px;">
              <span style="color:#fff;font-size:20px;font-weight:800;">
                Nex<span style="opacity:0.7;">Learn</span>
              </span>
              <p style="color:#9fe03c;margin:4px 0 0;font-size:13px;font-weight:600;">
                NEW CONTACT FORM MESSAGE
              </p>
            </div>
            <div style="padding:32px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;
                              font-size:13px;color:#6b7280;font-weight:600;
                              text-transform:uppercase;width:30%;">From</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;
                              font-size:15px;color:#111827;">${name}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;
                              font-size:13px;color:#6b7280;font-weight:600;
                              text-transform:uppercase;">Email</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;
                              font-size:15px;color:#0b408e;">${email}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;
                              font-size:13px;color:#6b7280;font-weight:600;
                              text-transform:uppercase;">Subject</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;
                              font-size:15px;color:#111827;">${subject}</td>
                </tr>
              </table>
              <div style="margin-top:24px;">
                <p style="font-size:13px;color:#6b7280;font-weight:600;
                           text-transform:uppercase;margin-bottom:12px;">Message</p>
                <div style="background:#f9fafb;border-left:4px solid #9fe03c;
                             border-radius:8px;padding:16px 20px;
                             font-size:15px;color:#374151;line-height:1.7;">
                  ${message.replace(/\n/g, "<br/>")}
                </div>
              </div>
              <p style="margin-top:24px;font-size:13px;color:#9ca3af;">
                💡 Reply directly to this email to respond to ${name}.
              </p>
            </div>
            <div style="background:#f9fafb;border-top:1px solid #e5e7eb;
                         padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} NexLearn · nexlearn.lk
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json(
      { message: "Message sent successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { message: "Failed to send message. Please try again." },
      { status: 500 },
    );
  }
}
