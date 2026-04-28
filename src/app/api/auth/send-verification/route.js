import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    // 1. Extract type, defaulting to EMAIL_VERIFICATION for backwards compatibility
    const { email, type = "EMAIL_VERIFICATION" } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { message: "If this email exists, a code has been sent." },
        { status: 200 },
      );
    }

    // 2. Only block if they are trying to verify an already verified email
    if (type === "EMAIL_VERIFICATION" && user.is_email_verified) {
      return NextResponse.json(
        { message: "Email is already verified." },
        { status: 400 },
      );
    }

    const now = new Date();

    // 3. Delete old tokens of THIS specific type
    await prisma.verificationToken.deleteMany({
      where: { userId: user.id, type },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expires = new Date(now.getTime() + 10 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        email,
        token: hashedOtp,
        type, // 4. Save the correct type in the DB
        expires,
        userId: user.id,
      },
    });

    // Note: You might want to pass 'type' to sendVerificationEmail to change the email subject line!
    await sendVerificationEmail(email, otp);

    return NextResponse.json(
      { message: "Verification code sent." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json(
      { message: "Failed to send verification code." },
      { status: 500 },
    );
  }
}
