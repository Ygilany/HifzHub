import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { classes } from "./classes";

/**
 * Session type enum - what kind of work was done
 */
export const sessionTypeEnum = pgEnum("session_type", [
  "NEW_HIFZ", // New memorization
  "RECENT_REVIEW", // Review of recently memorized (Sabqi)
  "OLD_REVIEW", // Review of older memorization (Manzil)
  "MIXED", // Combination of above
]);

/**
 * Attendance status enum
 */
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "PRESENT",
  "ABSENT",
  "EXCUSED",
  "LATE",
]);

/**
 * Sessions table
 * Records each teaching session with a student
 */
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Participants
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  classId: uuid("class_id").references(() => classes.id, {
    onDelete: "set null",
  }),

  // Session details
  sessionDate: timestamp("session_date").notNull(),
  sessionType: sessionTypeEnum("session_type").notNull(),
  attendanceStatus: attendanceStatusEnum("attendance_status")
    .default("PRESENT")
    .notNull(),

  // Duration in minutes
  durationMinutes: integer("duration_minutes"),

  // What was covered - Quran references
  startSurah: integer("start_surah"),
  startAyah: integer("start_ayah"),
  endSurah: integer("end_surah"),
  endAyah: integer("end_ayah"),
  ayahsCovered: integer("ayahs_covered"),

  // Quality assessment (1-5 scale)
  qualityRating: integer("quality_rating"),

  // Notes and feedback
  teacherNotes: text("teacher_notes"),
  mistakesSummary: text("mistakes_summary"),
  improvementNotes: text("improvement_notes"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
  student: one(users, {
    fields: [sessions.studentId],
    references: [users.id],
    relationName: "studentSessions",
  }),
  teacher: one(users, {
    fields: [sessions.teacherId],
    references: [users.id],
    relationName: "teacherSessions",
  }),
  class: one(classes, {
    fields: [sessions.classId],
    references: [classes.id],
  }),
}));

// Type exports
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
