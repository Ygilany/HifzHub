import { pgTable, uuid, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { programs } from "./programs";
import { classStudents } from "./relationships";

/**
 * Classes table
 * A class belongs to a program and can have multiple students
 */
export const classes = pgTable("classes", {
  id: uuid("id").defaultRandom().primaryKey(),
  programId: uuid("program_id")
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const classesRelations = relations(classes, ({ one, many }) => ({
  program: one(programs, {
    fields: [classes.programId],
    references: [programs.id],
  }),
  students: many(classStudents),
}));

// Type exports
export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;
