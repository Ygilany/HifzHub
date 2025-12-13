import { pgTable, uuid, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { programTeachers, programStudents } from "./relationships";
import { classes } from "./classes";

/**
 * Programs table
 * A program can have multiple teachers and multiple classes
 */
export const programs = pgTable("programs", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const programsRelations = relations(programs, ({ many }) => ({
  teachers: many(programTeachers),
  students: many(programStudents),
  classes: many(classes),
}));

// Type exports
export type Program = typeof programs.$inferSelect;
export type NewProgram = typeof programs.$inferInsert;
