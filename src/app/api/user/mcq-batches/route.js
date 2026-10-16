import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// ── GET /api/user/mcq-batches?lessonId={lessonId} ─────────────────────────────
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
    const rawLessonId =
      searchParams.get("lessonId") || searchParams.get("lesson_id");

    if (!rawLessonId) {
      return NextResponse.json(
        { success: false, message: "lessonId parameter is required" },
        { status: 400 }
      );
    }

    const lessonId = parseInt(rawLessonId);
    if (isNaN(lessonId)) {
      return NextResponse.json(
        { success: false, message: "Invalid lessonId parameter" },
        { status: 400 }
      );
    }

    // Fetch batches for this lesson
    const batches = await prisma.mcq_batches.findMany({
      where: { lesson_id: lessonId },
      orderBy: { sequence: "asc" },
      include: {
        _count: {
          select: { questions: true },
        },
        results: {
          where: { user_id: userId },
          orderBy: { completed_at: "desc" },
          select: {
            id: true,
            score: true,
            total_questions: true,
            percentage: true,
            time_taken: true,
            completed_at: true,
          },
        },
      },
    });

    const formattedBatches = batches.map((batch) => {
      const attempts = batch.results || [];
      const isCompleted = attempts.length > 0;

      let highScore = 0;
      let highestPercentage = 0;

      if (isCompleted) {
        highScore = Math.max(...attempts.map((a) => a.score));
        highestPercentage = Math.max(...attempts.map((a) => a.percentage));
      }

      const lastAttempt = isCompleted
        ? {
            id: attempts[0].id,
            score: attempts[0].score,
            totalQuestions: attempts[0].total_questions,
            percentage: attempts[0].percentage,
            timeTaken: attempts[0].time_taken,
            completedAt: attempts[0].completed_at,
          }
        : null;

      return {
        id: batch.id,
        lessonId: batch.lesson_id,
        title: batch.title,
        sequence: batch.sequence,
        totalQuestions: batch._count.questions,
        isCompleted,
        attemptCount: attempts.length,
        highScore: isCompleted ? highScore : null,
        highestPercentage: isCompleted ? highestPercentage : null,
        lastAttempt,
      };
    });

    return NextResponse.json({
      success: true,
      batches: formattedBatches,
    });
  } catch (error) {
    console.error("[GET /api/user/mcq-batches]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
