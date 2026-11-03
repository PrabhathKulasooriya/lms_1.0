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

    const userId = session.user.id ? parseInt(session.user.id) : null;
    const isAdmin = session.user.role === "admin";

    const where = {};
    if (!isAdmin && userId) {
      where.user_id = userId;
    }
    if (statusFilter && statusFilter !== "all") {
      where.status = statusFilter.toUpperCase();
    }

    // Include user, course, and cart_order relations gracefully
    let bankSlips;
    try {
      bankSlips = await prisma.bank_slips.findMany({
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
          cart_order: {
            include: {
              items: {
                include: {
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
              },
            },
          },
        },
      });
    } catch (includeErr) {
      console.warn("[GET /api/bank-slips] Including cart_order failed, falling back to base relations:", includeErr?.message);
      bankSlips = await prisma.bank_slips.findMany({
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
    }

    return ok({ bankSlips });
  } catch (error) {
    console.error("[GET /api/bank-slips]", error);
    return err(error?.message || "Internal Server Error", 500);
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
    const amountRaw = formData.get("amount");

    // Detect if this is a cart checkout or a single-course checkout
    const isCartCheckout = formData.get("isCartCheckout") === "true";
    const cartItemsRaw = formData.get("cartItems");
    const courseIdRaw = formData.get("courseId");

    if (!file || !(file instanceof File)) {
      return err("Payment slip image file is required");
    }

    // Check File Size (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return err("File size exceeds maximum limit of 5MB");
    }

    const userId = parseInt(session.user.id);
    const amount = amountRaw ? parseFloat(amountRaw) : 0;

    // Convert file to Buffer for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate custom filename: userid_timestamp_4randomdigits
    const timestamp = Math.floor(Date.now() / 1000);
    const random4Digits = Math.floor(1000 + Math.random() * 9000);

    if (isCartCheckout) {
      // ── CART CHECKOUT: multi-course order ────────────────────────────────
      if (!cartItemsRaw) {
        return err("Cart items are required for cart checkout");
      }

      let cartItems;
      try {
        cartItems = JSON.parse(cartItemsRaw);
      } catch {
        return err("Invalid cart items format");
      }

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return err("Cart must contain at least one course");
      }

      // Validate all courses exist and are published
      const courseIds = cartItems.map((i) => parseInt(i.courseId));
      const courses = await prisma.courses.findMany({
        where: { id: { in: courseIds }, is_published: true },
        select: { id: true, title: true, price: true, grade: true, type: true },
      });

      if (courses.length !== courseIds.length) {
        return err("One or more selected courses are unavailable");
      }

      // Check for existing enrollments (skip already-enrolled courses)
      const enrollments = await prisma.enrollments.findMany({
        where: {
          user_id: userId,
          course_id: { in: courseIds },
          is_active: true,
        },
        select: { course_id: true },
      });
      const enrolledIds = new Set(enrollments.map((e) => e.course_id));

      // Filter to only un-enrolled courses
      const billableCourses = cartItems.filter(
        (i) => !enrolledIds.has(parseInt(i.courseId))
      );

      if (billableCourses.length === 0) {
        return err("You are already enrolled in all selected courses");
      }

      const customFilename = `cart_${userId}_${timestamp}_${random4Digits}`;

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(buffer, "nexlearn/bank_slips", customFilename);

      // Create cart_order + cart_order_items + bank_slip in one transaction
      const primaryCourseId = parseInt(billableCourses[0].courseId);

      const bankSlip = await prisma.$transaction(async (tx) => {
        // 1. Create cart order
        const cartOrder = await tx.cart_orders.create({
          data: {
            user_id: userId,
            total_amount: amount,
            status: "PENDING",
            items: {
              create: billableCourses.map((item) => ({
                course_id: parseInt(item.courseId),
                price_at_purchase: parseFloat(item.price),
              })),
            },
          },
        });

        // 2. Create bank slip linked to cart order and primary course for full backwards-compatibility
        const slip = await tx.bank_slips.create({
          data: {
            user_id: userId,
            course_id: primaryCourseId,
            cart_order_id: cartOrder.id,
            amount: amount,
            slip_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            status: "PENDING",
          },
          include: {
            user: { select: { id: true, first_name: true, last_name: true, email: true } },
            course: { select: { id: true, title: true, grade: true, type: true } },
            cart_order: {
              include: {
                items: {
                  include: {
                    course: { select: { id: true, title: true, grade: true, type: true } },
                  },
                },
              },
            },
          },
        });

        return slip;
      });

      // Build a summary of course titles for email
      const courseTitles = bankSlip.cart_order.items
        .map((i) => {
          const c = i.course;
          return `${c.title}${c.grade ? ` (Grade ${c.grade})` : ""}${c.type === "pastpaper" ? " (Past Paper)" : ""}`;
        })
        .join(", ");

      const userName =
        `${session.user.first_name || ""} ${session.user.last_name || ""}`.trim() ||
        session.user.name;

      // Send emails asynchronously
      const orderSummary = `${billableCourses.length} course${billableCourses.length > 1 ? "s" : ""}: ${courseTitles}`;
      sendBankSlipReceivedEmail(session.user.email, userName, orderSummary, amount);
      sendAdminNewBankSlipNotificationEmail(userName, session.user.email, orderSummary, amount);

      return ok({ message: "Payment slip submitted successfully", bankSlip }, 201);

    } else {
      // ── SINGLE COURSE CHECKOUT (legacy path — unchanged behaviour) ────────
      const courseId = parseInt(courseIdRaw);
      if (!courseId || isNaN(courseId)) {
        return err("Valid courseId is required");
      }

      // Verify Course exists
      const course = await prisma.courses.findUnique({
        where: { id: courseId },
        select: { id: true, title: true, price: true, grade: true, type: true },
      });

      if (!course) {
        return err("Selected course not found", 404);
      }

      const finalAmount = amountRaw ? parseFloat(amountRaw) : course.price;
      const customFilename = `${userId}_${courseId}_${timestamp}_${random4Digits}`;

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(buffer, "nexlearn/bank_slips", customFilename);

      // Save Bank Slip Record in DB
      const bankSlip = await prisma.bank_slips.create({
        data: {
          user_id: userId,
          course_id: courseId,
          amount: finalAmount,
          slip_url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
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
      const userName =
        `${session.user.first_name || ""} ${session.user.last_name || ""}`.trim() ||
        session.user.name;
      sendBankSlipReceivedEmail(session.user.email, userName, fullCourseTitle, finalAmount);

      // Send notification email to admin (nexlearnlk@gmail.com)
      sendAdminNewBankSlipNotificationEmail(userName, session.user.email, fullCourseTitle, finalAmount);

      return ok({ message: "Payment slip submitted successfully", bankSlip }, 201);
    }
  } catch (error) {
    console.error("[POST /api/bank-slips]", error);
    return err("Failed to submit payment slip: " + (error.message || "Internal Server Error"), 500);
  }
}
