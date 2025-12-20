import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Student Profiles table
 * Extends user data with student-specific information
 */
export const studentProfiles = pgTable("student_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),

  // Quran progress tracking
  currentJuz: integer("current_juz").default(1).notNull(), // 1-30
  currentSurah: integer("current_surah").default(1).notNull(), // 1-114
  currentAyah: integer("current_ayah").default(1).notNull(),
  totalAyahsMemorized: integer("total_ayahs_memorized").default(0).notNull(),
  totalJuzCompleted: integer("total_juz_completed").default(0).notNull(),

  // Program enrollment date (when they joined)
  enrollmentDate: timestamp("enrollment_date").defaultNow().notNull(),

  // Additional info
  notes: text("notes"),
  preferredSessionTime: varchar("preferred_session_time", { length: 50 }),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const studentProfilesRelations = relations(
  studentProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [studentProfiles.userId],
      references: [users.id],
    }),
  })
);

// Type exports
export type StudentProfile = typeof studentProfiles.$inferSelect;
export type NewStudentProfile = typeof studentProfiles.$inferInsert;
