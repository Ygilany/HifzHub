import { and, eq } from "drizzle-orm";
import type { Database } from "../client";
import { classStudents, programStudents, programTeachers } from "../schema";

interface SeedRelationshipsParams {
  teacherId: string;
  studentId: string;
  programId: string;
  classId: string;
}

export const seedRelationships = async (
  db: Database,
  params: SeedRelationshipsParams
) => {
  console.log("🔗 Seeding relationships...");

  const { teacherId, studentId, programId, classId } = params;

  // Associate teacher to program
  const existingTeacherProgram = await db.query.programTeachers.findFirst({
    where: and(
      eq(programTeachers.programId, programId),
      eq(programTeachers.teacherId, teacherId)
    ),
  });

  if (!existingTeacherProgram) {
    try {
      await db.insert(programTeachers).values({
        programId,
        teacherId,
      });
      console.log(`  ✅ Teacher associated with program`);
    } catch (err: any) {
      throw new Error(`Failed to associate teacher with program: ${err.message}`);
    }
  } else {
    console.log(`  ⏭️  Teacher-program relationship (already exists)`);
  }

  // Associate student to program
  const existingStudentProgram = await db.query.programStudents.findFirst({
    where: and(
      eq(programStudents.programId, programId),
      eq(programStudents.studentId, studentId)
    ),
  });

  if (!existingStudentProgram) {
    try {
      await db.insert(programStudents).values({
        programId,
        studentId,
      });
      console.log(`  ✅ Student associated with program`);
    } catch (err: any) {
      throw new Error(`Failed to associate student with program: ${err.message}`);
    }
  } else {
    console.log(`  ⏭️  Student-program relationship (already exists)`);
  }

  // Associate student to class
  const existingStudentClass = await db.query.classStudents.findFirst({
    where: and(
      eq(classStudents.classId, classId),
      eq(classStudents.studentId, studentId)
    ),
  });

  if (!existingStudentClass) {
    try {
      await db.insert(classStudents).values({
        classId,
        studentId,
      });
      console.log(`  ✅ Student associated with class`);
    } catch (err: any) {
      throw new Error(`Failed to associate student with class: ${err.message}`);
    }
  } else {
    console.log(`  ⏭️  Student-class relationship (already exists)`);
  }

  console.log("✅ Relationships seeded\n");
};
