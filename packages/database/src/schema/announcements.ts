import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { classes } from "./classes";
import { programs } from "./programs";
import { users } from "./users";

/**
 * Announcements broadcast by a teacher to a program (optionally narrowed
 * to a single class within that program).
 */
export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    classId: uuid("class_id").references(() => classes.id, {
      onDelete: "cascade",
    }),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    programIdIdx: index("announcements_program_id_idx").on(table.programId),
    classIdIdx: index("announcements_class_id_idx").on(table.classId),
    teacherIdIdx: index("announcements_teacher_id_idx").on(table.teacherId),
    createdAtIdx: index("announcements_created_at_idx").on(table.createdAt),
  }),
);

export const announcementsRelations = relations(announcements, ({ one }) => ({
  program: one(programs, {
    fields: [announcements.programId],
    references: [programs.id],
  }),
  class: one(classes, {
    fields: [announcements.classId],
    references: [classes.id],
  }),
  teacher: one(users, {
    fields: [announcements.teacherId],
    references: [users.id],
  }),
}));

export type Announcement = typeof announcements.$inferSelect;
export type NewAnnouncement = typeof announcements.$inferInsert;
