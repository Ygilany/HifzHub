-- Add phone columns to users table
ALTER TABLE "users" ADD COLUMN "phone" varchar(20);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "alternate_phone" varchar(20);
--> statement-breakpoint

-- NOTE: student_parents was already created in 0001_polite_yellowjacket.sql
-- (duplicate CREATE TABLE removed to prevent failure on fresh databases)

-- Create enums for goals
DO $$ BEGIN
  CREATE TYPE "goal_type" AS ENUM('SEMESTER', 'ANNUAL', 'CUSTOM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "goal_status" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- Create enums for sessions
DO $$ BEGIN
  CREATE TYPE "session_type" AS ENUM('NEW_HIFZ', 'RECENT_REVIEW', 'OLD_REVIEW', 'MIXED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "attendance_status" AS ENUM('PRESENT', 'ABSENT', 'EXCUSED', 'LATE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- Create student_profiles table
CREATE TABLE "student_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL UNIQUE,
	"current_juz" integer DEFAULT 1 NOT NULL,
	"current_surah" integer DEFAULT 1 NOT NULL,
	"current_ayah" integer DEFAULT 1 NOT NULL,
	"total_ayahs_memorized" integer DEFAULT 0 NOT NULL,
	"total_juz_completed" integer DEFAULT 0 NOT NULL,
	"enrollment_date" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"preferred_session_time" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Create student_goals table
CREATE TABLE "student_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"type" "goal_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"target_juz" integer,
	"target_surah" integer,
	"target_ayahs" integer,
	"current_progress" integer DEFAULT 0 NOT NULL,
	"status" "goal_status" DEFAULT 'NOT_STARTED' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Create sessions table
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"class_id" uuid,
	"session_date" timestamp NOT NULL,
	"session_type" "session_type" NOT NULL,
	"attendance_status" "attendance_status" DEFAULT 'PRESENT' NOT NULL,
	"duration_minutes" integer,
	"start_surah" integer,
	"start_ayah" integer,
	"end_surah" integer,
	"end_ayah" integer,
	"ayahs_covered" integer,
	"quality_rating" integer,
	"teacher_notes" text,
	"mistakes_summary" text,
	"improvement_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Add foreign key constraint for student_profiles
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Add foreign key constraints for student_goals
ALTER TABLE "student_goals" ADD CONSTRAINT "student_goals_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "student_goals" ADD CONSTRAINT "student_goals_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- Add foreign key constraints for sessions
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- Create indexes for sessions
CREATE INDEX "sessions_student_id_idx" ON "sessions" USING btree ("student_id");
--> statement-breakpoint
CREATE INDEX "sessions_teacher_id_idx" ON "sessions" USING btree ("teacher_id");
--> statement-breakpoint
CREATE INDEX "sessions_date_idx" ON "sessions" USING btree ("session_date");
--> statement-breakpoint

-- Create indexes for student_goals
CREATE INDEX "student_goals_student_id_idx" ON "student_goals" USING btree ("student_id");
--> statement-breakpoint
CREATE INDEX "student_goals_type_idx" ON "student_goals" USING btree ("type");
