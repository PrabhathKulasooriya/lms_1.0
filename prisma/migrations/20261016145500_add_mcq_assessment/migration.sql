-- AlterEnum
ALTER TYPE "CourseType" ADD VALUE 'mcq';

-- CreateTable
CREATE TABLE "mcq_batches" (
    "id" SERIAL NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "mcq_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "option_a" TEXT NOT NULL,
    "option_b" TEXT NOT NULL,
    "option_c" TEXT NOT NULL,
    "option_d" TEXT NOT NULL,
    "correct_option" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mcq_results" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "total_questions" INTEGER NOT NULL DEFAULT 10,
    "percentage" DOUBLE PRECISION NOT NULL,
    "time_taken" INTEGER NOT NULL,
    "user_answers" JSONB NOT NULL,
    "completed_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mcq_results_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mcq_batches" ADD CONSTRAINT "mcq_batches_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "mcq_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcq_results" ADD CONSTRAINT "mcq_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcq_results" ADD CONSTRAINT "mcq_results_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "mcq_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
