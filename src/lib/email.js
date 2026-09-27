import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  toEmail,
  otp,
  type = "EMAIL_VERIFICATION",
) {
  const config = {
    EMAIL_VERIFICATION: {
      subject: "Verify your email – NexLearn",
      heading: "Verify Your Email",
      subheading: "Thanks for signing up!",
      message: "Enter the code below to verify your email address.",
      footerNote:
        "You're receiving this because you created a NexLearn account.",
      accentColor: "#0b408e",
      iconBg: "#dbeafe",
      icon: `
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#0b408e" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>`,
    },
    PASSWORD_RESET: {
      subject: "Reset your password – NexLearn",
      heading: "Reset Your Password",
      subheading: "We received a password reset request.",
      message:
        "Enter the code below to reset your password. If you didn't request this, please ignore this email.",
      footerNote:
        "You're receiving this because a password reset was requested for your account.",
      accentColor: "#7c3aed",
      iconBg: "#ede9fe",
      icon: `
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#7c3aed" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>`,
    },
  };

  const {
    subject,
    heading,
    subheading,
    message,
    footerNote,
    accentColor,
    iconBg,
    icon,
  } = config[type] ?? config.EMAIL_VERIFICATION;

  await resend.emails.send({
    from: "NexLearn <noreply@nexlearn.lk>",
    to: toEmail,
    subject,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;
               box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">

          <!-- Header bar -->
          <tr>
            <td style="background:${accentColor};padding:28px 32px;text-align:center;">
              <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                Nex<span style="opacity:0.75;">Learn</span>
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 24px;">

              <!-- Icon -->
              <div style="width:64px;height:64px;background:${iconBg};border-radius:50%;
                          display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">
                <table width="64" height="64" cellpadding="0" cellspacing="0">
                  <tr><td align="center" valign="middle">${icon}</td></tr>
                </table>
              </div>

              <!-- Heading -->
              <h1 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#111827;text-align:center;">
                ${heading}
              </h1>
              <p style="margin:0 0 20px;font-size:14px;color:#6b7280;text-align:center;">
                ${subheading}
              </p>

              <!-- Message -->
              <p style="margin:0 0 24px;font-size:15px;color:#374151;text-align:center;line-height:1.6;">
                ${message}
              </p>

              <!-- OTP Box -->
              <div style="background:#f9fafb;border:2px dashed ${accentColor};border-radius:12px;
                          padding:24px;text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:600;
                           color:#9ca3af;letter-spacing:1.5px;text-transform:uppercase;">
                  Your verification code
                </p>
                <div style="font-size:42px;font-weight:800;letter-spacing:14px;
                             color:${accentColor};line-height:1;">
                  ${otp}
                </div>
                <p style="margin:12px 0 0;font-size:12px;color:#9ca3af;">
                  ⏱ Expires in <strong>10 minutes</strong>
                </p>
              </div>

              <!-- Warning -->
              <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;
                          padding:12px 16px;margin-bottom:8px;">
                <p style="margin:0;font-size:13px;color:#92400e;text-align:center;">
                  🔒 Never share this code with anyone. NexLearn will never ask for it.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;
                        padding:20px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">
                ${footerNote}
              </p>
              <p style="margin:0;font-size:12px;color:#d1d5db;">
                © ${new Date().getFullYear()} NexLearn · nexlearn.lk
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

export async function sendBankSlipReceivedEmail(toEmail, userName, courseTitle, amount) {
  try {
    await resend.emails.send({
      from: "NexLearn <noreply@nexlearn.lk>",
      to: toEmail,
      subject: `Payment Slip Received – ${courseTitle}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Payment Slip Received</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
          <tr>
            <td style="background:#0b408e;padding:28px 32px;text-align:center;">
              <span style="font-size:22px;font-weight:800;color:#ffffff;">NexLearn</span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 24px;">
              <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;">Payment Slip Received!</h1>
              <p style="margin:0 0 16px;font-size:14px;color:#4b5563;line-height:1.6;">
                Hi ${userName || "Student"},
              </p>
              <p style="margin:0 0 16px;font-size:14px;color:#4b5563;line-height:1.6;">
                We have received your payment transfer slip for <strong>${courseTitle}</strong> (Amount: LKR ${Number(amount).toLocaleString()}).
              </p>
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin-bottom:20px;">
                <p style="margin:0;font-size:13px;color:#1e40af;line-height:1.5;">
                  🔍 <strong>Under Review:</strong> Our administrative team is reviewing your bank deposit. Once verified, your course enrollment will be automatically activated and you will receive a confirmation email.
                </p>
              </div>
              <p style="margin:0;font-size:13px;color:#6b7280;">
                If you have any urgent questions, feel free to contact us via WhatsApp (071 156 2002).
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} NexLearn · nexlearn.lk</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });
  } catch (error) {
    console.error("[sendBankSlipReceivedEmail]", error);
  }
}

export async function sendEnrollmentApprovedEmail(toEmail, userName, courseTitle) {
  try {
    await resend.emails.send({
      from: "NexLearn <noreply@nexlearn.lk>",
      to: toEmail,
      subject: `Payment Verified & Course Enrolled! – ${courseTitle}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Enrollment Confirmed</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
          <tr>
            <td style="background:#0b408e;padding:28px 32px;text-align:center;">
              <span style="font-size:22px;font-weight:800;color:#ffffff;">NexLearn</span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 24px;">
              <div style="background:#ecfdf5;border-radius:50%;width:56px;height:56px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
                <span style="font-size:28px;">🎉</span>
              </div>
              <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;text-align:center;">Enrollment Approved!</h1>
              <p style="margin:0 0 16px;font-size:14px;color:#4b5563;line-height:1.6;">
                Hi ${userName || "Student"},
              </p>
              <p style="margin:0 0 16px;font-size:14px;color:#4b5563;line-height:1.6;">
                Great news! Your bank payment transfer slip for <strong>${courseTitle}</strong> has been verified and approved by our team.
              </p>
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
                <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#166534;">
                  You now have full access to your course lessons & study materials.
                </p>
                <a href="https://www.nexlearn.lk/dashboard" style="display:inline-block;background:#0b408e;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;">
                  Go to Dashboard
                </a>
              </div>
              <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;">
                Thank you for learning with NexLearn!
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} NexLearn · nexlearn.lk</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });
  } catch (error) {
    console.error("[sendEnrollmentApprovedEmail]", error);
  }
}

export async function sendAdminNewBankSlipNotificationEmail(studentName, studentEmail, courseTitle, amount) {
  try {
    await resend.emails.send({
      from: "NexLearn Alert <noreply@nexlearn.lk>",
      to: "nexlearnlk@gmail.com",
      subject: `New Payment Slip Awaiting Approval – ${courseTitle}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New Bank Slip Uploaded</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
          <tr>
            <td style="background:#0b408e;padding:24px 32px;text-align:center;">
              <span style="font-size:20px;font-weight:800;color:#ffffff;">NexLearn Admin Alert</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px;">
              <h2 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#111827;">New Payment Slip Awaiting Approval</h2>
              <p style="margin:0 0 16px;font-size:14px;color:#4b5563;line-height:1.6;">
                A new bank transfer payment slip has been submitted and is waiting for review and approval.
              </p>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:20px;font-size:13px;color:#334155;line-height:1.6;">
                <p style="margin:0 0 6px;"><strong>Student:</strong> ${studentName || "Student"} (${studentEmail})</p>
                <p style="margin:0 0 6px;"><strong>Course:</strong> ${courseTitle}</p>
                <p style="margin:0;"><strong>Amount:</strong> LKR ${Number(amount).toLocaleString()}</p>
              </div>
              <div style="text-align:center;margin-top:20px;">
                <a href="https://www.nexlearn.lk/dashboard" style="display:inline-block;background:#0b408e;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;">
                  Open Admin Dashboard
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:14px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">NexLearn LMS Admin Notification</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });
  } catch (error) {
    console.error("[sendAdminNewBankSlipNotificationEmail]", error);
  }
}

