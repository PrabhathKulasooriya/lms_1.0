import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { sendBankSlipReceivedEmail, sendAdminNewBankSlipNotificationEmail } from "@/lib/email";

// Helper responses
const ok = (data, status = 200) =>
  NextResponse.json({ success: true, ...data }, { status });
const err = (message, status = 400) =>
  NextResponse.json({ success: false, message }, { status });

// ── GET /api/bank-slips ────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return err("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    const userId = parseInt(session.user.id);
    const isAdmin = session.user.role === "admin";

    const where = {};
    if (!isAdmin) {
      where.user_id = userId;
    }
    if (statusFilter && statusFilter !== "all") {
      where.status = statusFilter.toUpperCase();
    }

    const bankSlips = await prisma.bank_slips.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            mobile: true,
            address: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            grade: true,
            type: true,
          },
        },
      },
    });

    return ok({ bankSlips });
  } catch (error) {
    console.error("[GET /api/bank-slips]", error);
    return err("Internal Server Error", 500);
  }
}

// ── POST /api/bank-slips ───────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return err("Unauthorized. Please log in to submit a payment slip.", 401);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const courseIdRaw = formData.get("courseId");
    const amountRaw = formData.get("amount");
    const depositorName = formData.get("depositorName") || null;
    const referenceNo = formData.get("referenceNo") || null;

    if (!file || !(file instanceof File)) {
      return err("Payment slip image file is required");
    }

    const courseId = parseInt(courseIdRaw);
    if (!courseId || isNaN(courseId)) {
      return err("Valid courseId is required");
    }

    // Check File Size (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return err("File size exceeds maximum limit of 5MB");
    }

    // Verify Course exists
    const course = await prisma.courses.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, price: true, grade: true, type: true },
    });

    if (!course) {
      return err("Selected course not found", 404);
    }

    const userId = parseInt(session.user.id);
    const amount = amountRaw ? parseFloat(amountRaw) : course.price;

    // Convert file to Buffer for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate custom filename: userid_courseid_timestamp_4randomdigits
    const timestamp = Math.floor(Date.now() / 1000);
    const random4Digits = Math.floor(1000 + Math.random() * 9000);
    const customFilename = `${userId}_${courseId}_${timestamp}_${random4Digits}`;

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(buffer, "nexlearn/bank_slips", customFilename);

    // Save Bank Slip Record in DB
    const bankSlip = await prisma.bank_slips.create({
      data: {
        user_id: userId,
        course_id: courseId,
        amount: amount,
        slip_url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        depositor_name: depositorName,
        reference_no: referenceNo,
        status: "PENDING",
      },
      include: {
        user: { select: { id: true, first_name: true, last_name: true, email: true } },
        course: { select: { id: true, title: true, grade: true, type: true } },
      },
    });

    // Format full course title with Grade / Type
    const fullCourseTitle = `${course.title}${course.grade ? ` (Grade ${course.grade})` : ""}${course.type === "pastpaper" ? " (Past Paper)" : ""}`;

    // Send email notification to student asynchronously
    const userName = `${session.user.first_name || ""} ${session.user.last_name || ""}`.trim() || session.user.name;
    sendBankSlipReceivedEmail(session.user.email, userName, fullCourseTitle, amount);

    // Send notification email to admin (nexlearnlk@gmail.com)
    sendAdminNewBankSlipNotificationEmail(userName, session.user.email, fullCourseTitle, amount);

    return ok({ message: "Payment slip submitted successfully", bankSlip }, 201);
  } catch (error) {
    console.error("[POST /api/bank-slips]", error);
    return err("Failed to submit payment slip: " + (error.message || "Internal Server Error"), 500);
  }
}
