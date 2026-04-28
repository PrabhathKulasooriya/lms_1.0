import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  ...(process.env.SMTP_USER && {
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  }),
});

export async function sendVerificationEmail(toEmail, otp) {
  await transporter.sendMail({
    from: `"YourApp" <${process.env.SMTP_FROM}>`,
    to: toEmail,
    subject: "Your Email Verification Code",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Use the code below to verify your account. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center;
                    padding: 20px; background: #f4f4f4; border-radius: 8px; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 13px;">If you didn't request this, you can safely ignore it.</p>
      </div>
    `,
  });
}
