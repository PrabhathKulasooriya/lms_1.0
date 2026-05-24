"use server";

import crypto from "crypto";
import { auth } from "@/auth";

/**
 * Generates the signed PayHere form parameters.
 * The client submits these via a hidden <form> POST to PayHere's checkout URL.
 */
export async function getPayHereFormData(
  courseId,
  price,
  title,
  userEmail,
  fullName,
) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized: You must be logged in.");

  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

  if (!merchantId || !merchantSecret) {
    throw new Error("PayHere credentials are not configured.");
  }

  // Unique order ID: NX_{courseId}_{userId}_{timestamp}
  const orderId = `NX_${courseId}_${session.user.id}_${Date.now()}`;
  const amount = Number(price).toFixed(2);
  const currency = "LKR";

  // PayHere hash: MD5( merchantId + orderId + amount + currency + MD5(secret).toUpperCase() )
  const hashedSecret = crypto
    .createHash("md5")
    .update(merchantSecret)
    .digest("hex")
    .toUpperCase();

  const hash = crypto
    .createHash("md5")
    .update(`${merchantId}${orderId}${amount}${currency}${hashedSecret}`)
    .digest("hex")
    .toUpperCase();

  // Split full name into first / last
  const nameParts = (fullName || "Customer").trim().split(" ");
  const firstName = nameParts[0] || "Customer";
  const lastName = nameParts.slice(1).join(" ") || "-";

  return {
    merchant_id: merchantId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/learnings/${courseId}?purchase=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}/checkout`,
    notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/payhere`,
    order_id: orderId,
    items: title,
    currency,
    amount,
    first_name: firstName,
    last_name: lastName,
    email: userEmail,
    phone: "0771234567", // PayHere requires a phone number; replace with real user phone if stored
    address: "No Address",
    city: "Colombo",
    country: "Sri Lanka",
    hash,
    // Pass courseId and userId through PayHere's custom fields
    custom_1: courseId.toString(),
    custom_2: session.user.id.toString(),
  };
}
