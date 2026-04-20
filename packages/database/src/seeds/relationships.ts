import { and, eq } from "drizzle-orm";
import type { Database } from "../client";
import {
  classStudents,
  programStudents,
  programTeachers,
  studentParents,
} from "../schema";

interface SeedRelationshipsParams {
  teacherId: string;
  studentIds: string[];
  parentId: string;
  primaryStudentId: string; // parent is linked to this student
  programId: string;
  classId: string;
}

async function ensureTeacherProgram(db: Database, programId: string, teacherId: string) {
  const exists = await db.query.programTeachers.findFirst({
    where: and(eq(programTeachers.programId, programId), eq(programTeachers.teacherId, teacherId)),
  });
  if (exists) { console.log("  ⏭️  Teacher-program (already exists)"); return; }
  await db.insert(programTeachers).values({ programId, teacherId });
  console.log("  ✅ Teacher → program");
}

async function ensureStudentProgram(db: Database, programId: string, studentId: string) {
  const exists = await db.query.programStudents.findFirst({
    where: and(eq(programStudents.programId, programId), eq(programStudents.studentId, studentId)),
  });
  if (exists) { console.log(`  ⏭️  Student-program (${studentId}) already exists`); return; }
  await db.insert(programStudents).values({ programId, studentId });
  console.log(`  ✅ Student (${studentId}) → program`);
}

async function ensureStudentClass(db: Database, classId: string, studentId: string) {
  const exists = await db.query.classStudents.findFirst({
    where: and(eq(classStudents.classId, classId), eq(classStudents.studentId, studentId)),
  });
  if (exists) { console.log(`  ⏭️  Student-class (${studentId}) already exists`); return; }
  await db.insert(classStudents).values({ classId, studentId });
  console.log(`  ✅ Student (${studentId}) → class`);
}

async function ensureStudentParent(db: Database, studentId: string, parentId: string) {
  const exists = await db.query.studentParents.findFirst({
    where: and(eq(studentParents.studentId, studentId), eq(studentParents.parentId, parentId)),
  });
  if (exists) { console.log("  ⏭️  Student-parent (already exists)"); return; }
  await db.insert(studentParents).values({ studentId, parentId });
  console.log("  ✅ Parent → student");
}

export const seedRelationships = async (
  db: Database,
  params: SeedRelationshipsParams,
) => {
  console.log("🔗 Seeding relationships...");

  const { teacherId, studentIds, parentId, primaryStudentId, programId, classId } = params;

  await ensureTeacherProgram(db, programId, teacherId);
  for (const sid of studentIds) {
    await ensureStudentProgram(db, programId, sid);
    await ensureStudentClass(db, classId, sid);
  }
  await ensureStudentParent(db, primaryStudentId, parentId);

  console.log("✅ Relationships seeded\n");
};
