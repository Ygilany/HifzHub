-- Ensure phone/alternate_phone exist on users.
-- Migration 0003 may have been recorded as applied on databases where it
-- previously failed (due to the duplicate student_parents table), leaving
-- these columns absent. This migration adds them idempotently.
DO $$ BEGIN
  ALTER TABLE "users" ADD COLUMN "phone" varchar(20);
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "users" ADD COLUMN "alternate_phone" varchar(20);
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;
