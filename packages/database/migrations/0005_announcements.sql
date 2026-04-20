-- Create announcements table
CREATE TABLE IF NOT EXISTS "announcements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "program_id" uuid NOT NULL,
  "class_id" uuid,
  "teacher_id" uuid NOT NULL,
  "title" varchar(200) NOT NULL,
  "body" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "announcements"
    ADD CONSTRAINT "announcements_program_id_programs_id_fk"
    FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "announcements"
    ADD CONSTRAINT "announcements_class_id_classes_id_fk"
    FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "announcements"
    ADD CONSTRAINT "announcements_teacher_id_users_id_fk"
    FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "announcements_program_id_idx" ON "announcements" ("program_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "announcements_class_id_idx" ON "announcements" ("class_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "announcements_teacher_id_idx" ON "announcements" ("teacher_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "announcements_created_at_idx" ON "announcements" ("created_at");
