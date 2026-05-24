import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// PayHere calls this server-to-server after every payment.
// This route must NOT require authentication.
export async function POST(req) {
  try {
    const formData = await req.formData();

    const merchantId = formData.get("merchant_id");
    const orderId = formData.get("order_id");
    const payhereAmount = formData.get("payhere_amount");
    const payhereCurrency = formData.get("payhere_currency");
    const statusCode = formData.get("status_code");
    const md5sig = formData.get("md5sig");
    const paymentId = formData.get("payment_id");
    const courseId = formData.get("custom_1");
    const userId = formData.get("custom_2");

    console.log("PayHere webhook received:", {
      orderId,
      statusCode,
      paymentId,
      courseId,
      userId,
    });

    // ── Verify signature ───────────────────────────────────────────────────
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    const hashedSecret = crypto
      .createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase();

    const localSig = crypto
      .createHash("md5")
      .update(
        `${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${hashedSecret}`,
      )
      .digest("hex")
      .toUpperCase();

    if (localSig !== md5sig) {
      console.error("PayHere webhook: signature mismatch");
      return new Response("Invalid signature", { status: 400 });
    }

    // ── Only process status_code 2 (Success) ──────────────────────────────
    if (statusCode !== "2") {
      console.log(`PayHere webhook: status ${statusCode} — skipping`);
      return new Response("Not a success status", { status: 200 });
    }

    if (!courseId || !userId) {
      console.error("PayHere webhook: missing custom fields");
      return new Response("Missing custom fields", { status: 400 });
    }

    // ── Idempotency ────────────────────────────────────────────────────────
    const alreadyProcessed = await prisma.purchases.findFirst({
      where: { payment_reference: paymentId },
    });

    if (alreadyProcessed) {
      console.log(`Already processed: ${paymentId}`);
      return new Response("Already processed", { status: 200 });
    }

    // ── Expiry date ────────────────────────────────────────────────────────
    const course = await prisma.courses.findUnique({
      where: { id: parseInt(courseId) },
      select: { grade: true, type: true },
    });

    const settings = await prisma.system_settings.findMany({
      where: { key: { in: ["EXPIRY_DATE_G10", "EXPIRY_DATE_G11"] } },
    });

    let expiresAtDate = null;
    let settingKey = null;

    if (course?.type === "pastpaper") {
      settingKey = "EXPIRY_DATE_G11";
    } else {
      const grade = String(course?.grade);
      if (grade === "10") settingKey = "EXPIRY_DATE_G10";
      if (grade === "11") settingKey = "EXPIRY_DATE_G11";
    }

    if (settingKey) {
      const match = settings.find((s) => s.key === settingKey);
      if (match) expiresAtDate = new Date(match.value);
    }

    // ── Create purchase + enrollment ───────────────────────────────────────
    await prisma.$transaction(async (tx) => {
      await tx.purchases.create({
        data: {
          user_id: parseInt(userId),
          payment_reference: paymentId,
          total_amount: parseFloat(payhereAmount),
          status: "COMPLETED",
          items: {
            create: {
              course_id: parseInt(courseId),
              price_paid: parseFloat(payhereAmount),
            },
          },
        },
      });

      await tx.enrollments.upsert({
        where: {
          user_id_course_id: {
            user_id: parseInt(userId),
            course_id: parseInt(courseId),
          },
        },
        update: { is_active: true, expires_at: expiresAtDate },
        create: {
          user_id: parseInt(userId),
          course_id: parseInt(courseId),
          is_active: true,
          expires_at: expiresAtDate,
        },
      });
    });

    console.log(`Webhook: enrolled user ${userId} in course ${courseId}`);
    return new Response("Success", { status: 200 });
  } catch (error) {
    console.error("PayHere webhook error:", error);
    return new Response("Server Error", { status: 500 });
  }
}
