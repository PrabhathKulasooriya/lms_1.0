"use server";

import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";

export async function handlePurchase(
  courseId,
  userId,
  price,
  title,
  userEmail,
  fullName,
) {
  const sessionAuth = await auth();

  if (!sessionAuth) {
    throw new Error("Unauthorized: You must be logged in to purchase.");
  }

  // 1. Look up the customer by email
  const existingCustomers = await stripe.customers.list({
    email: userEmail,
    limit: 1,
  });

  let stripeCustomerId;

  // 2. Use existing customer or create a new one to autofill Name & Email
  if (existingCustomers.data.length > 0) {
    stripeCustomerId = existingCustomers.data[0].id;
  } else {
    const newCustomer = await stripe.customers.create({
      email: userEmail,
      name: fullName,
      metadata: {
        userId: userId.toString(),
      },
    });
    stripeCustomerId = newCustomer.id;
  }

  // 3. Create the checkout session attached to the customer
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId, // 👈 This is the magic line that autofills the form!
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
