import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(req) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, courseId } = session.metadata;

    if (!userId || !courseId) {
      return new Response("Missing metadata", { status: 400 });
    }

    const alreadyProcessed = await prisma.purchases.findFirst({
      where: { stripe_session_id: session.id },
    });

    if (alreadyProcessed) {
      console.log(`Webhook already processed for session ${session.id}`);
      return new Response("Already processed", { status: 200 });
    }

    try {
      // 1. Fetch BOTH grade and type
      const course = await prisma.courses.findUnique({
        where: { id: parseInt(courseId) },
        select: { grade: true, type: true },
      });

      const settings = await prisma.system_settings.findMany({
        where: {
          key: { in: ["EXPIRY_DATE_G10", "EXPIRY_DATE_G11"] },
        },
      });

      let expiresAtDate = null;
      let settingKeyToUse = null;

      // 2. Safely check the course type and grade
      if (course?.type === "pastpaper") {
        // Past papers expire with the current Grade 11 batch
        settingKeyToUse = "EXPIRY_DATE_G11";
      } else {
        // Force the grade to a string to avoid Prisma Int vs String bugs
        const gradeStr = String(course?.grade);
        if (gradeStr === "10") settingKeyToUse = "EXPIRY_DATE_G10";
        if (gradeStr === "11") settingKeyToUse = "EXPIRY_DATE_G11";
      }

      if (settingKeyToUse) {
        const matchedSetting = settings.find((s) => s.key === settingKeyToUse);
        if (matchedSetting) {
          expiresAtDate = new Date(matchedSetting.value);
        }
      }

      await prisma.$transaction(async (tx) => {
        await tx.purchases.create({
          data: {
            user_id: parseInt(userId),
            stripe_session_id: session.id,
            total_amount: session.amount_total / 100,
            status: "COMPLETED",
            items: {
              create: {
                course_id: parseInt(courseId),
                price_paid: session.amount_total / 100,
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
        `Successfully processed purchase for User ${userId}, Course ${courseId}`,
      );
    } catch (dbError) {
      console.error("Database transaction failed:", dbError);
      return new Response("Database Error", { status: 500 });
    }
  }

  return new Response("Success", { status: 200 });
}
