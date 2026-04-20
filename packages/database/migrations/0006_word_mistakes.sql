-- Create word_mistakes table
-- Tracks word-level Quran reading mistakes recorded by a teacher.
-- Rows are grouped into a "batch" (one save operation) via batch_id.
CREATE TABLE "word_mistakes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"page_index" integer NOT NULL,
	"line_index" integer NOT NULL,
	"word_index" integer NOT NULL,
	"word_text" text NOT NULL,
	"mistake_type" varchar(20) NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

ALTER TABLE "word_mistakes" ADD CONSTRAINT "word_mistakes_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "word_mistakes" ADD CONSTRAINT "word_mistakes_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

CREATE INDEX "word_mistakes_batch_id_idx" ON "word_mistakes" USING btree ("batch_id");
--> statement-breakpoint
CREATE INDEX "word_mistakes_student_id_idx" ON "word_mistakes" USING btree ("student_id");
--> statement-breakpoint
CREATE INDEX "word_mistakes_student_recorded_at_idx" ON "word_mistakes" USING btree ("student_id", "recorded_at");
