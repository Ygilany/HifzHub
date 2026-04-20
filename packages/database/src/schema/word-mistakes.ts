import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users";

/**
 * Word-level Quran reading mistakes recorded by a teacher during a session.
 * Each row is one marked word. Rows are grouped into a "batch" (one save
 * operation) via batchId so we can retrieve the latest set per student.
 */
export const wordMistakes = pgTable(
  "word_mistakes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    batchId: uuid("batch_id").notNull(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    pageIndex: integer("page_index").notNull(),
    lineIndex: integer("line_index").notNull(),
    wordIndex: integer("word_index").notNull(),
    wordText: text("word_text").notNull(),
    // 'memory' | 'tashkeel' | 'tajweed' | 'corrected'
    mistakeType: varchar("mistake_type", { length: 20 }).notNull(),

    recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  },
  (table) => ({
    batchIdx: index("word_mistakes_batch_id_idx").on(table.batchId),
    studentIdx: index("word_mistakes_student_id_idx").on(table.studentId),
    studentRecordedIdx: index("word_mistakes_student_recorded_at_idx").on(
      table.studentId,
      table.recordedAt,
    ),
  }),
);

export const wordMistakesRelations = relations(wordMistakes, ({ one }) => ({
  student: one(users, {
    fields: [wordMistakes.studentId],
    references: [users.id],
    relationName: "studentWordMistakes",
  }),
  teacher: one(users, {
    fields: [wordMistakes.teacherId],
    references: [users.id],
    relationName: "teacherWordMistakes",
  }),
}));

export type WordMistake = typeof wordMistakes.$inferSelect;
export type NewWordMistake = typeof wordMistakes.$inferInsert;
