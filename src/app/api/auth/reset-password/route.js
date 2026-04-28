import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long." },
        { status: 400 },
      );
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid request." },
        { status: 400 },
      );
    }

    // 1. Find the active password reset token
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        userId: user.id,
        type: "PASSWORD_RESET",
      },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { message: "Session expired. Please request a new password reset." },
        { status: 400 },
      );
    }

    // 2. Check if it expired
    if (new Date() > tokenRecord.expires) {
      await prisma.verificationToken.delete({ where: { id: tokenRecord.id } });
      return NextResponse.json(
        { message: "Code has expired. Please request a new one." },
        { status: 400 },
      );
    }

    // 3. Verify the OTP against the hash in the database
    const isValid = await bcrypt.compare(otp, tokenRecord.token);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid verification code." },
        { status: 400 },
      );
    }

    // 4. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Transaction: Update password AND delete token so it can't be reused
    await prisma.$transaction([
      prisma.users.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.delete({ where: { id: tokenRecord.id } }),
    ]);

    return NextResponse.json(
      { message: "Password updated successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Failed to reset password." },
      { status: 500 },
    );
  }
}
