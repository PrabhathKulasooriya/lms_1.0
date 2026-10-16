import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// ── GET /api/admin/mcq-batches/[id] ───────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session || session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    const batch = await prisma.mcq_batches.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { id: "asc" } },
        _count: { select: { results: true, questions: true } },
      },
    });

    if (!batch) {
      return NextResponse.json(
        { success: false, message: "MCQ batch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      batch: {
        id: batch.id,
        lessonId: batch.lesson_id,
        title: batch.title,
        sequence: batch.sequence,
        totalQuestions: batch._count.questions,
        attemptsCount: batch._count.results,
        createdAt: batch.created_at,
        questions: batch.questions.map((q) => ({
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
    console.error("[GET /api/admin/mcq-batches/[id]]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ── PUT /api/admin/mcq-batches/[id] ───────────────────────────────────────────
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id: idParam } = await params;
    const batchId = parseInt(idParam);
    if (isNaN(batchId)) {
      return NextResponse.json(
        { success: false, message: "Invalid batch ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, sequence, questions } = body;

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

    const updatedBatch = await prisma.$transaction(async (tx) => {
      await tx.mcq_batches.update({
        where: { id: batchId },
        data: {
          title: title.trim(),
          sequence: batchSequence,
        },
      });

      const existingQMap = new Map(
        existingBatch.questions.map((q) => [q.id, q])
      );
      const processedIds = new Set();

      for (let i = 0; i < sanitizedQuestions.length; i++) {
        const sq = sanitizedQuestions[i];
        const targetId = sq.id;

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
    console.error("[PUT /api/admin/mcq-batches/[id]]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// ── DELETE /api/admin/mcq-batches/[id] ────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || session?.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    await prisma.mcq_batches.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Batch deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE /api/admin/mcq-batches/[id]]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
