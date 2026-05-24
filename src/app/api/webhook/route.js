import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * PayHere Notification (Webhook) Handler
 *
 * PayHere POSTs form data to this URL after every payment attempt.
 * Status codes: 2 = Success, 0 = Pending, -1 = Cancelled, -2 = Failed, -3 = Charged Back
 *
 * ⚠️  This route must NOT require authentication — PayHere calls it server-to-server.
 */
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

    // ── 1. Verify PayHere signature ──────────────────────────────────────────
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

    // ── 2. Only process successful payments (status_code === "2") ────────────
    if (statusCode !== "2") {
      console.log(
        `PayHere webhook: non-success status ${statusCode} for order ${orderId}`,
      );
      return new Response("Payment not successful", { status: 200 }); // 200 so PayHere doesn't retry
    }

    if (!courseId || !userId) {
      console.error("PayHere webhook: missing custom fields");
      return new Response("Missing custom fields", { status: 400 });
    }

    // ── 3. Idempotency — skip if already processed ───────────────────────────
    const alreadyProcessed = await prisma.purchases.findFirst({
      where: { payment_reference: paymentId },
    });

    if (alreadyProcessed) {
      console.log(`PayHere webhook: already processed payment ${paymentId}`);
      return new Response("Already processed", { status: 200 });
    }

    // ── 4. Determine enrollment expiry date from system settings ─────────────
    const course = await prisma.courses.findUnique({
      where: { id: parseInt(courseId) },
      select: { grade: true, type: true },
    });

    const settings = await prisma.system_settings.findMany({
      where: { key: { in: ["EXPIRY_DATE_G10", "EXPIRY_DATE_G11"] } },
    });

    let expiresAtDate = null;
    let settingKeyToUse = null;

    if (course?.type === "pastpaper") {
      settingKeyToUse = "EXPIRY_DATE_G11";
    } else {
      const gradeStr = String(course?.grade);
      if (gradeStr === "10") settingKeyToUse = "EXPIRY_DATE_G10";
      if (gradeStr === "11") settingKeyToUse = "EXPIRY_DATE_G11";
    }

    if (settingKeyToUse) {
      const matchedSetting = settings.find((s) => s.key === settingKeyToUse);
      if (matchedSetting) expiresAtDate = new Date(matchedSetting.value);
    }

    // ── 5. Create purchase record & enroll user (atomic transaction) ─────────
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
        update: {
          is_active: true,
          expires_at: expiresAtDate,
        },
        create: {
          user_id: parseInt(userId),
          course_id: parseInt(courseId),
          is_active: true,
          expires_at: expiresAtDate,
        },
      });
    });

    console.log(
      `PayHere webhook: enrolled User ${userId} in Course ${courseId} (payment ${paymentId})`,
    );
    return new Response("Success", { status: 200 });
  } catch (error) {
    console.error("PayHere webhook error:", error);
    return new Response("Server Error", { status: 500 });
  }
}
