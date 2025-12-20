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

/**
 * Goal type enum
 */
export const goalTypeEnum = pgEnum("goal_type", [
  "SEMESTER",
  "ANNUAL",
  "CUSTOM",
]);

/**
 * Goal status enum
 */
export const goalStatusEnum = pgEnum("goal_status", [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "OVERDUE",
]);

/**
 * Student Goals table
 * Tracks semester and annual memorization goals
 */
export const studentGoals = pgTable("student_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Goal type and period
  type: goalTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),

  // Target (in ayahs or juz)
  targetJuz: integer("target_juz"), // Target juz to complete
  targetSurah: integer("target_surah"), // Target surah to reach
  targetAyahs: integer("target_ayahs"), // Target number of ayahs

  // Progress tracking
  currentProgress: integer("current_progress").default(0).notNull(), // Ayahs completed towards goal
  status: goalStatusEnum("status").default("NOT_STARTED").notNull(),

  // Date range
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),

  // Created by (teacher who set the goal)
  createdById: uuid("created_by_id").references(() => users.id, {
    onDelete: "set null",
  }),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const studentGoalsRelations = relations(studentGoals, ({ one }) => ({
  student: one(users, {
    fields: [studentGoals.studentId],
    references: [users.id],
    relationName: "studentGoals",
  }),
  createdBy: one(users, {
    fields: [studentGoals.createdById],
    references: [users.id],
    relationName: "createdGoals",
  }),
}));

// Type exports
export type StudentGoal = typeof studentGoals.$inferSelect;
export type NewStudentGoal = typeof studentGoals.$inferInsert;
