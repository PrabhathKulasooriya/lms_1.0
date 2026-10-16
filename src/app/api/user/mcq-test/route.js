import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// ── GET /api/user/mcq-test?batchId={batchId} ──────────────────────────────────
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawBatchId =
      searchParams.get("batchId") || searchParams.get("batch_id");

    if (!rawBatchId) {
      return NextResponse.json(
        { success: false, message: "batchId parameter is required" },
        { status: 400 }
      );
    }

    const batchId = parseInt(rawBatchId);
    if (isNaN(batchId)) {
      return NextResponse.json(
        { success: false, message: "Invalid batchId parameter" },
        { status: 400 }
      );
    }

    // Fetch batch and questions
    // CRITICAL SECURITY: Exclude correct_option from select
    const batch = await prisma.mcq_batches.findUnique({
      where: { id: batchId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            course_id: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        questions: {
          orderBy: { id: "asc" },
          select: {
            id: true,
            question_text: true,
            option_a: true,
            option_b: true,
            option_c: true,
            option_d: true,
            // STRICTLY EXCLUDED: correct_option
          },
        },
      },
    });

    if (!batch) {
      return NextResponse.json(
        { success: false, message: "MCQ Batch not found" },
        { status: 404 }
      );
    }

    const formattedQuestions = batch.questions.map((q, idx) => ({
      id: q.id,
      index: idx + 1,
      questionText: q.question_text,
      optionA: q.option_a,
      optionB: q.option_b,
      optionC: q.option_c,
      optionD: q.option_d,
      options: {
        A: q.option_a,
        B: q.option_b,
        C: q.option_c,
        D: q.option_d,
      },
    }));

    return NextResponse.json({
      success: true,
      batch: {
        id: batch.id,
        title: batch.title,
        sequence: batch.sequence,
        lessonId: batch.lesson_id,
        lessonTitle: batch.lesson?.title || "",
        courseId: batch.lesson?.course_id || null,
        courseTitle: batch.lesson?.course?.title || "",
        timeLimit: 1200, // 20 minutes countdown in seconds
        totalQuestions: formattedQuestions.length,
        questions: formattedQuestions,
      },
    });
  } catch (error) {
    console.error("[GET /api/user/mcq-test]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
