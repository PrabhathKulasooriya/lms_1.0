import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// ── GET /api/user/mcq-history ─────────────────────────────────────────────────
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "50"));
    const batchIdParam = searchParams.get("batchId") || searchParams.get("batch_id");

    const where = {
      user_id: userId,
      ...(batchIdParam && { batch_id: parseInt(batchIdParam) }),
    };

    const results = await prisma.mcq_results.findMany({
      where,
      orderBy: { completed_at: "desc" },
      take: limit,
      include: {
        batch: {
          include: {
            lesson: {
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                    grade: true,
                    type: true,
                  },
                },
              },
            },
            questions: {
              orderBy: { id: "asc" },
            },
          },
        },
      },
    });

    const formattedHistory = results.map((res) => {
      const userAnswersMap = res.user_answers || {};

      // Reconstruct itemized review from stored answers and questions
      const review = (res.batch?.questions || []).map((q) => {
        const selected = userAnswersMap[String(q.id)] || null;
        return {
          questionId: q.id,
          questionText: q.question_text,
          optionA: q.option_a,
          optionB: q.option_b,
          optionC: q.option_c,
          optionD: q.option_d,
          selectedOption: selected,
          correctOption: q.correct_option,
          isCorrect: selected === q.correct_option,
        };
      });

      return {
        id: res.id,
        batchId: res.batch_id,
        batchTitle: res.batch?.title || "Test Batch",
        sequence: res.batch?.sequence || 1,
        lessonId: res.batch?.lesson_id,
        lessonTitle: res.batch?.lesson?.title || "",
        courseId: res.batch?.lesson?.course?.id,
        courseTitle: res.batch?.lesson?.course?.title || "",
        courseGrade: res.batch?.lesson?.course?.grade,
        courseType: res.batch?.lesson?.course?.type,
        score: res.score,
        totalQuestions: res.total_questions,
        percentage: res.percentage,
        timeTaken: res.time_taken,
        completedAt: res.completed_at,
        review,
      };
    });

    return NextResponse.json({
      success: true,
      history: formattedHistory,
    });
  } catch (error) {
    console.error("[GET /api/user/mcq-history]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
