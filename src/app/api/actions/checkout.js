"use server";

import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";

export async function handlePurchase(courseId, userId, price, title) {
  const sessionAuth = await auth();

  if (!sessionAuth) {
    throw new Error("Unauthorized: You must be logged in to purchase.");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "lkr",
          product_data: { name: title },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      courseId: courseId.toString(),
      userId: userId.toString(),
    },
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/learnings/${courseId}?purchase=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses`,
  });

  return session.url; 
}
