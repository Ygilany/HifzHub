-- Create enums for assignments
DO $$ BEGIN
  CREATE TYPE "assignment_type" AS ENUM('NEW_MEMORIZATION', 'RECENT_REVISION', 'DISTANT_REVISION');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "assignment_status" AS ENUM('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'INCOMPLETE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- Create assignments table
CREATE TABLE "assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"type" "assignment_type" NOT NULL,
	"status" "assignment_status" DEFAULT 'ASSIGNED' NOT NULL,
	"start_surah" integer NOT NULL,
	"start_ayah" integer NOT NULL,
	"end_surah" integer NOT NULL,
	"end_ayah" integer NOT NULL,
	"ayah_count" integer,
	"grade" integer,
	"notes" text,
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Create indexes
CREATE INDEX "assignments_session_id_idx" ON "assignments" USING btree ("session_id");
--> statement-breakpoint
CREATE INDEX "assignments_student_id_idx" ON "assignments" USING btree ("student_id");
--> statement-breakpoint
CREATE INDEX "assignments_type_idx" ON "assignments" USING btree ("type");
--> statement-breakpoint
