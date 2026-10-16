import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// ── POST /api/user/submit-mcq ─────────────────────────────────────────────────
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const {
      batchId: rawBatchId,
      batch_id: altBatchId,
      timeTaken: rawTimeTaken,
      time_taken: altTimeTaken,
      answers,
      userAnswers,
    } = body;

    const batchId = parseInt(rawBatchId || altBatchId);
    if (!batchId || isNaN(batchId)) {
      return NextResponse.json(
        { success: false, message: "Valid batchId is required" },
        { status: 400 }
      );
    }

    const timeTaken = Math.max(0, parseInt(rawTimeTaken ?? altTimeTaken ?? 0));

    // Fetch batch & its official questions with correct_option
    const batch = await prisma.mcq_batches.findUnique({
      where: { id: batchId },
      include: {
        questions: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!batch) {
      return NextResponse.json(
        { success: false, message: "MCQ Batch not found" },
        { status: 404 }
      );
    }

    if (!batch.questions || batch.questions.length === 0) {
      return NextResponse.json(
        { success: false, message: "No questions found for this batch" },
        { status: 400 }
      );
    }

    // Normalize incoming user choices into a map: { [questionId]: selectedOption }
    const answersMap = {};
    const inputChoices = answers || userAnswers || [];

    if (Array.isArray(inputChoices)) {
      for (const item of inputChoices) {
        if (item && item.questionId !== undefined) {
          answersMap[String(item.questionId)] = item.selectedOption
            ? String(item.selectedOption).trim().toUpperCase()
            : null;
        } else if (item && item.id !== undefined) {
          answersMap[String(item.id)] = item.selectedOption
            ? String(item.selectedOption).trim().toUpperCase()
            : null;
        }
      }
    } else if (typeof inputChoices === "object" && inputChoices !== null) {
      for (const [qId, opt] of Object.entries(inputChoices)) {
        answersMap[String(qId)] = opt ? String(opt).trim().toUpperCase() : null;
      }
    }

    // Evaluate answers securely on server
    let calculatedScore = 0;
    const reviewItems = [];

    for (const q of batch.questions) {
      const selectedOption = answersMap[String(q.id)] || null;
      const isCorrect = selectedOption === q.correct_option;

      if (isCorrect) {
        calculatedScore++;
      }

      reviewItems.push({
        questionId: q.id,
        questionText: q.question_text,
        optionA: q.option_a,
        optionB: q.option_b,
        optionC: q.option_c,
        optionD: q.option_d,
        selectedOption: selectedOption,
        correctOption: q.correct_option,
        isCorrect: isCorrect,
      });
    }

    const totalQuestions = batch.questions.length;
    const percentage =
      totalQuestions > 0
        ? parseFloat(((calculatedScore / totalQuestions) * 100).toFixed(1))
        : 0;

    // Save attempt record in mcq_results
    const resultRecord = await prisma.mcq_results.create({
      data: {
        user_id: userId,
        batch_id: batchId,
        score: calculatedScore,
        total_questions: totalQuestions,
        percentage: percentage,
        time_taken: timeTaken,
        user_answers: answersMap,
      },
    });

    return NextResponse.json({
      success: true,
      result: {
        id: resultRecord.id,
        batchId: resultRecord.batch_id,
        batchTitle: batch.title,
        score: calculatedScore,
        totalQuestions: totalQuestions,
        percentage: percentage,
        timeTaken: timeTaken,
        completedAt: resultRecord.completed_at,
        review: reviewItems,
      },
    });
  } catch (error) {
    console.error("[POST /api/user/submit-mcq]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
