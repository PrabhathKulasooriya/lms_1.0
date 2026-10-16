import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// ── GET /api/admin/mcq-batches?lessonId=X ─────────────────────────────────────
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId") || searchParams.get("lesson_id");

    if (!lessonId) {
      return NextResponse.json(
        { success: false, message: "lessonId query parameter is required" },
        { status: 400 }
      );
    }

    const batches = await prisma.mcq_batches.findMany({
      where: { lesson_id: parseInt(lessonId) },
      orderBy: { sequence: "asc" },
      include: {
        questions: {
          select: {
            id: true,
            question_text: true,
            option_a: true,
            option_b: true,
            option_c: true,
            option_d: true,
            correct_option: true,
          },
        },
        _count: {
          select: {
            results: true,
            questions: true,
          },
        },
      },
    });

    const formattedBatches = batches.map((b) => ({
      id: b.id,
      lessonId: b.lesson_id,
      title: b.title,
      sequence: b.sequence,
      totalQuestions: b._count.questions,
      attemptsCount: b._count.results,
      createdAt: b.created_at,
      questions: b.questions.map((q) => ({
        id: q.id,
        questionText: q.question_text,
        optionA: q.option_a,
        optionB: q.option_b,
        optionC: q.option_c,
        optionD: q.option_d,
        correctOption: q.correct_option,
      })),
    }));

    return NextResponse.json({ success: true, batches: formattedBatches });
  } catch (error) {
    console.error("[GET /api/admin/mcq-batches]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ── POST /api/admin/mcq-batches ───────────────────────────────────────────────
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      lessonId: rawLessonId,
      lesson_id: altLessonId,
      title,
      sequence,
      questions,
    } = body;

    const lessonId = rawLessonId || altLessonId;

    if (!lessonId) {
      return NextResponse.json(
        { success: false, message: "lessonId is required" },
        { status: 400 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "title is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(questions) || questions.length !== 10) {
      return NextResponse.json(
        {
          success: false,
          message: `Each batch must hold exactly 10 questions. Provided: ${
            Array.isArray(questions) ? questions.length : 0
          }`,
        },
        { status: 400 }
      );
    }

    // Verify target lesson exists
    const lesson = await prisma.lessons.findUnique({
      where: { id: parseInt(lessonId) },
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, message: "Specified lesson does not exist" },
        { status: 404 }
      );
    }

    // Validate each of the 10 questions
    const validOptions = ["A", "B", "C", "D"];
    const sanitizedQuestions = [];

    for (let i = 0; i < 10; i++) {
      const q = questions[i];
      const qText = (q?.questionText ?? q?.question_text ?? "").trim();
      const optA = (q?.optionA ?? q?.option_a ?? "").trim();
      const optB = (q?.optionB ?? q?.option_b ?? "").trim();
      const optC = (q?.optionC ?? q?.option_c ?? "").trim();
      const optD = (q?.optionD ?? q?.option_d ?? "").trim();
      const rawCorrect = (q?.correctOption ?? q?.correct_option ?? "")
        .trim()
        .toUpperCase();

      if (!qText) {
        return NextResponse.json(
          { success: false, message: `Question #${i + 1} text is required` },
          { status: 400 }
        );
      }
      if (!optA || !optB || !optC || !optD) {
        return NextResponse.json(
          {
            success: false,
            message: `Question #${i + 1} must have all 4 options (A, B, C, D) filled`,
          },
          { status: 400 }
        );
      }
      if (!validOptions.includes(rawCorrect)) {
        return NextResponse.json(
          {
            success: false,
            message: `Question #${i + 1} correctOption must be 'A', 'B', 'C', or 'D'`,
          },
          { status: 400 }
        );
      }

      sanitizedQuestions.push({
        question_text: qText,
        option_a: optA,
        option_b: optB,
        option_c: optC,
        option_d: optD,
        correct_option: rawCorrect,
      });
    }

    // Determine sequence number if not provided
    let batchSequence = parseInt(sequence);
    if (isNaN(batchSequence) || batchSequence < 1) {
      const highestSequenceBatch = await prisma.mcq_batches.findFirst({
        where: { lesson_id: parseInt(lessonId) },
        orderBy: { sequence: "desc" },
        select: { sequence: true },
      });
      batchSequence = (highestSequenceBatch?.sequence ?? 0) + 1;
    }

    // Execute batch and 10 questions creation in a single transaction
    const newBatch = await prisma.$transaction(async (tx) => {
      return await tx.mcq_batches.create({
        data: {
          lesson_id: parseInt(lessonId),
          title: title.trim(),
          sequence: batchSequence,
          questions: {
            create: sanitizedQuestions,
          },
        },
        include: {
          questions: true,
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "MCQ batch created successfully with 10 questions",
        batch: {
          id: newBatch.id,
          lessonId: newBatch.lesson_id,
          title: newBatch.title,
          sequence: newBatch.sequence,
          questionsCount: newBatch.questions.length,
          createdAt: newBatch.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/admin/mcq-batches]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ── PUT /api/admin/mcq-batches ────────────────────────────────────────────────
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paramId = searchParams.get("id");
    const body = await request.json();

    const rawBatchId = body.id || body.batchId || paramId;
    if (!rawBatchId) {
      return NextResponse.json(
        { success: false, message: "Batch id is required" },
        { status: 400 }
      );
    }

    const batchId = parseInt(rawBatchId);
    if (isNaN(batchId)) {
      return NextResponse.json(
        { success: false, message: "Invalid batch id" },
        { status: 400 }
      );
    }

    const existingBatch = await prisma.mcq_batches.findUnique({
      where: { id: batchId },
      include: {
        questions: { orderBy: { id: "asc" } },
      },
    });

    if (!existingBatch) {
      return NextResponse.json(
        { success: false, message: "MCQ batch not found" },
        { status: 404 }
      );
    }

    const { title, sequence, questions } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "title is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(questions) || questions.length !== 10) {
      return NextResponse.json(
        {
          success: false,
          message: `Each batch must hold exactly 10 questions. Provided: ${
            Array.isArray(questions) ? questions.length : 0
          }`,
        },
        { status: 400 }
      );
    }

    // Validate 10 questions
    const validOptions = ["A", "B", "C", "D"];
    const sanitizedQuestions = [];

    for (let i = 0; i < 10; i++) {
      const q = questions[i];
      const qText = (q?.questionText ?? q?.question_text ?? "").trim();
      const optA = (q?.optionA ?? q?.option_a ?? "").trim();
      const optB = (q?.optionB ?? q?.option_b ?? "").trim();
      const optC = (q?.optionC ?? q?.option_c ?? "").trim();
      const optD = (q?.optionD ?? q?.option_d ?? "").trim();
      const rawCorrect = (q?.correctOption ?? q?.correct_option ?? "")
        .trim()
        .toUpperCase();
      const qId = q?.id ? parseInt(q.id) : null;

      if (!qText) {
        return NextResponse.json(
          { success: false, message: `Question #${i + 1} text is required` },
          { status: 400 }
        );
      }
      if (!optA || !optB || !optC || !optD) {
        return NextResponse.json(
          {
            success: false,
            message: `Question #${i + 1} must have all 4 options (A, B, C, D) filled`,
          },
          { status: 400 }
        );
      }
      if (!validOptions.includes(rawCorrect)) {
        return NextResponse.json(
          {
            success: false,
            message: `Question #${i + 1} correctOption must be 'A', 'B', 'C', or 'D'`,
          },
          { status: 400 }
        );
      }

      sanitizedQuestions.push({
        id: qId,
        question_text: qText,
        option_a: optA,
        option_b: optB,
        option_c: optC,
        option_d: optD,
        correct_option: rawCorrect,
      });
    }

    const batchSequence =
      sequence !== undefined
        ? parseInt(sequence) || existingBatch.sequence
        : existingBatch.sequence;

    // Execute update in a transaction
    const updatedBatch = await prisma.$transaction(async (tx) => {
      // 1. Update batch info
      await tx.mcq_batches.update({
        where: { id: batchId },
        data: {
          title: title.trim(),
          sequence: batchSequence,
        },
      });

      // 2. Update existing questions or insert
      const existingQMap = new Map(
        existingBatch.questions.map((q) => [q.id, q])
      );
      const processedIds = new Set();

      for (let i = 0; i < sanitizedQuestions.length; i++) {
        const sq = sanitizedQuestions[i];
        const targetId = sq.id;

        // If targetId is provided and exists in this batch, update that question
        if (targetId && existingQMap.has(targetId)) {
          await tx.questions.update({
            where: { id: targetId },
            data: {
              question_text: sq.question_text,
              option_a: sq.option_a,
              option_b: sq.option_b,
              option_c: sq.option_c,
              option_d: sq.option_d,
              correct_option: sq.correct_option,
            },
          });
          processedIds.add(targetId);
        } else if (existingBatch.questions[i]) {
          // If no ID or ID doesn't match, map by position to preserve question row ID
          const existingQ = existingBatch.questions[i];
          await tx.questions.update({
            where: { id: existingQ.id },
            data: {
              question_text: sq.question_text,
              option_a: sq.option_a,
              option_b: sq.option_b,
              option_c: sq.option_c,
              option_d: sq.option_d,
              correct_option: sq.correct_option,
            },
          });
          processedIds.add(existingQ.id);
        } else {
          // Create new question
          const created = await tx.questions.create({
            data: {
              batch_id: batchId,
              question_text: sq.question_text,
              option_a: sq.option_a,
              option_b: sq.option_b,
              option_c: sq.option_c,
              option_d: sq.option_d,
              correct_option: sq.correct_option,
            },
          });
          processedIds.add(created.id);
        }
      }

      // Remove any extra questions beyond the 10 (if any existed before)
      for (const eq of existingBatch.questions) {
        if (!processedIds.has(eq.id)) {
          await tx.questions.delete({ where: { id: eq.id } });
        }
      }

      return await tx.mcq_batches.findUnique({
        where: { id: batchId },
        include: {
          questions: { orderBy: { id: "asc" } },
          _count: { select: { results: true, questions: true } },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "MCQ batch updated successfully",
      batch: {
        id: updatedBatch.id,
        lessonId: updatedBatch.lesson_id,
        title: updatedBatch.title,
        sequence: updatedBatch.sequence,
        totalQuestions: updatedBatch._count.questions,
        attemptsCount: updatedBatch._count.results,
        questions: updatedBatch.questions.map((q) => ({
          id: q.id,
          questionText: q.question_text,
          optionA: q.option_a,
          optionB: q.option_b,
          optionC: q.option_c,
          optionD: q.option_d,
          correctOption: q.correct_option,
        })),
      },
    });
  } catch (error) {
    console.error("[PUT /api/admin/mcq-batches]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ── DELETE /api/admin/mcq-batches ─────────────────────────────────────────────
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session || session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id query parameter is required" },
        { status: 400 }
      );
    }

    await prisma.mcq_batches.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Batch deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/admin/mcq-batches]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
