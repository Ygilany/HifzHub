import { relations } from "drizzle-orm";
import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { classes } from "./classes";
import { programs } from "./programs";
import { users } from "./users";

/**
 * Program-Teacher relationship table
 * Many-to-many: A program can have multiple teachers, and a teacher can be in multiple programs
 */
export const programTeachers = pgTable(
  "program_teachers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Ensure a program-teacher pair is unique
    programTeacherUnique: index("program_teacher_unique").on(
      table.programId,
      table.teacherId
    ),
    // Index for quick lookup of teachers by program
    programIdIdx: index("program_teachers_program_id_idx").on(table.programId),
    // Index for quick lookup of programs by teacher
    teacherIdIdx: index("program_teachers_teacher_id_idx").on(table.teacherId),
  })
);

/**
 * Program-Student relationship table
 * Many-to-many: A program can have multiple students, and a student can be in multiple programs
 */
export const programStudents = pgTable(
  "program_students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Ensure a program-student pair is unique
    programStudentUnique: index("program_student_unique").on(
      table.programId,
      table.studentId
    ),
    // Index for quick lookup of students by program
    programIdIdx: index("program_students_program_id_idx").on(table.programId),
    // Index for quick lookup of programs by student
    studentIdIdx: index("program_students_student_id_idx").on(table.studentId),
  })
);

/**
 * Class-Student relationship table
 * Many-to-many: A class can have multiple students, and a student can be in multiple classes
 */
export const classStudents = pgTable(
  "class_students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Ensure a class-student pair is unique
    classStudentUnique: index("class_student_unique").on(
      table.classId,
      table.studentId
    ),
    // Index for quick lookup of students by class
    classIdIdx: index("class_students_class_id_idx").on(table.classId),
    // Index for quick lookup of classes by student
    studentIdIdx: index("class_students_student_id_idx").on(table.studentId),
  })
);

/**
 * Student-Parent relationship table
 * Many-to-many: A student can have multiple parents, and a parent can have multiple children
 */
export const studentParents = pgTable(
  "student_parents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Ensure a student-parent pair is unique
    studentParentUnique: index("student_parent_unique").on(
      table.studentId,
      table.parentId
    ),
    // Index for quick lookup of children by parent
    parentIdIdx: index("student_parents_parent_id_idx").on(table.parentId),
    // Index for quick lookup of parents by student
    studentIdIdx: index("student_parents_student_id_idx").on(table.studentId),
  })
);

// Relations
export const programTeachersRelations = relations(programTeachers, ({ one }) => ({
  program: one(programs, {
    fields: [programTeachers.programId],
    references: [programs.id],
  }),
  teacher: one(users, {
    fields: [programTeachers.teacherId],
    references: [users.id],
  }),
}));

export const programStudentsRelations = relations(programStudents, ({ one }) => ({
  program: one(programs, {
    fields: [programStudents.programId],
    references: [programs.id],
  }),
  student: one(users, {
    fields: [programStudents.studentId],
    references: [users.id],
  }),
}));

export const classStudentsRelations = relations(classStudents, ({ one }) => ({
  class: one(classes, {
    fields: [classStudents.classId],
    references: [classes.id],
  }),
  student: one(users, {
    fields: [classStudents.studentId],
    references: [users.id],
  }),
}));

export const studentParentsRelations = relations(studentParents, ({ one }) => ({
  student: one(users, {
    fields: [studentParents.studentId],
    references: [users.id],
  }),
  parent: one(users, {
    fields: [studentParents.parentId],
    references: [users.id],
  }),
}));

// Type exports
export type ProgramTeacher = typeof programTeachers.$inferSelect;
export type NewProgramTeacher = typeof programTeachers.$inferInsert;
export type ProgramStudent = typeof programStudents.$inferSelect;
export type NewProgramStudent = typeof programStudents.$inferInsert;
export type ClassStudent = typeof classStudents.$inferSelect;
export type NewClassStudent = typeof classStudents.$inferInsert;
export type StudentParent = typeof studentParents.$inferSelect;
export type NewStudentParent = typeof studentParents.$inferInsert;
