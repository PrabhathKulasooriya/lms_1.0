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

    // Guard against duplicate webhook delivery from Stripe retries
    const alreadyProcessed = await prisma.purchases.findFirst({
      where: { stripe_session_id: session.id },
    });

    if (alreadyProcessed) {
      console.log(`Webhook already processed for session ${session.id}`);
      return new Response("Already processed", { status: 200 });
    }

    try {
      await prisma.$transaction(async (tx) => {
        // Create the purchase + line item
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

        // Upsert enrollment — safe against unique constraint errors on retries
        await tx.enrollments.upsert({
          where: {
            user_id_course_id: {
              user_id: parseInt(userId),
              course_id: parseInt(courseId),
            },
          },
          update: {},
          create: {
            user_id: parseInt(userId),
            course_id: parseInt(courseId),
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
