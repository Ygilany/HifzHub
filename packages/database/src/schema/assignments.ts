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
import { sessions } from "./sessions";

/**
 * Assignment type enum
 */
export const assignmentTypeEnum = pgEnum("assignment_type", [
  "NEW_MEMORIZATION", // New hifz
  "RECENT_REVISION", // Sabqi - recent review
  "DISTANT_REVISION", // Manzil - older review
]);

/**
 * Assignment status enum
 */
export const assignmentStatusEnum = pgEnum("assignment_status", [
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "INCOMPLETE",
]);

/**
 * Assignments table
 * Tracks individual assignments given to students during sessions
 */
export const assignments = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Link to session (assignment is part of a session)
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),

  // Student receiving the assignment
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Assignment details
  type: assignmentTypeEnum("type").notNull(),
  status: assignmentStatusEnum("status").default("ASSIGNED").notNull(),

  // Quran range for the assignment
  startSurah: integer("start_surah").notNull(),
  startAyah: integer("start_ayah").notNull(),
  endSurah: integer("end_surah").notNull(),
  endAyah: integer("end_ayah").notNull(),

  // Calculated field for convenience
  ayahCount: integer("ayah_count"),

  // Quality/performance on this assignment (1-5)
  grade: integer("grade"),

  // Notes and feedback
  notes: text("notes"),

  // Due date (for homework assignments)
  dueDate: timestamp("due_date"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const assignmentsRelations = relations(assignments, ({ one }) => ({
  session: one(sessions, {
    fields: [assignments.sessionId],
    references: [sessions.id],
  }),
  student: one(users, {
    fields: [assignments.studentId],
    references: [users.id],
  }),
}));

// Type exports
export type Assignment = typeof assignments.$inferSelect;
export type NewAssignment = typeof assignments.$inferInsert;
