import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { db, pool } from "./client";
import { seedAnnouncements } from "./seeds/announcements";
import { seedAssignments } from "./seeds/assignments";
import { seedClasses } from "./seeds/classes";
import { seedGoals } from "./seeds/goals";
import { seedPrograms } from "./seeds/programs";
import { seedRelationships } from "./seeds/relationships";
import { seedSessions } from "./seeds/sessions";
import { seedStudentProfiles } from "./seeds/student-profiles";
import { seedUsers } from "./seeds/users";
import { seedWordMistakes } from "./seeds/word-mistakes";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../../.env") });

const seedDatabase = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("🌱 Seeding database...\n");

  try {
    // ── 1. Users ────────────────────────────────────────────────────────────
    const users = await seedUsers(db);

    const teacher  = users.find((u) => u.role === "TEACHER");
    const students = users.filter((u) => u.role === "STUDENT");
    const parent   = users.find((u) => u.role === "PARENT");
    const ahmad    = students.find((u) => u.email === "ahmad@hifzhub.com");

    if (!teacher) throw new Error("Teacher user not found after seeding");
    if (!ahmad)   throw new Error("Student (Ahmad) not found after seeding");
    if (!parent)  throw new Error("Parent user not found after seeding");

    // ── 2. Programs & classes ────────────────────────────────────────────────
    const seededPrograms = await seedPrograms(db);
    const icgc = seededPrograms.find((p) => p.name === "ICGC");
    if (!icgc) throw new Error("ICGC program not found after seeding");

    const classData = await seedClasses(db, icgc.id, "Beginner Class");

    // ── 3. Relationships ─────────────────────────────────────────────────────
    await seedRelationships(db, {
      teacherId: teacher.id,
      studentIds: students.map((s) => s.id),
      parentId: parent.id,
      primaryStudentId: ahmad.id,
      programId: icgc.id,
      classId: classData.id,
    });

    // ── 4. Student profiles ──────────────────────────────────────────────────
    await seedStudentProfiles(db, [
      {
        userId: ahmad.id,
        currentJuz: 29,
        currentSurah: 67,   // Al-Mulk (in progress)
        currentAyah: 5,
        totalAyahsMemorized: 200,
        totalJuzCompleted: 1,
        notes: "Strong memorization ability. Needs to work on tashkeel consistency.",
        preferredSessionTime: "Sat/Sun 10am",
      },
      {
        userId: students.find((u) => u.email === "sara@hifzhub.com")!.id,
        currentJuz: 30,
        currentSurah: 112,  // Al-Ikhlas
        currentAyah: 1,
        totalAyahsMemorized: 120,
        totalJuzCompleted: 0,
        preferredSessionTime: "Mon/Wed 4pm",
      },
    ]);

    // ── 5. Sessions (Ahmad) ──────────────────────────────────────────────────
    const seededSessions = await seedSessions(db, ahmad.id, teacher.id, classData.id);

    // ── 6. Assignments (linked to Ahmad's sessions) ──────────────────────────
    const sessionMap = new Map(seededSessions.map((s) => [s.dayOffset, s.id]));
    await seedAssignments(db, ahmad.id, sessionMap);

    // ── 7. Goals (Ahmad) ─────────────────────────────────────────────────────
    await seedGoals(db, ahmad.id, teacher.id);

    // ── 8. Word mistakes (Ahmad) ─────────────────────────────────────────────
    await seedWordMistakes(db, ahmad.id, teacher.id);

    // ── 9. Announcements ─────────────────────────────────────────────────────
    await seedAnnouncements(db, teacher.id, icgc.id, classData.id);

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log("🎉 Database seeding completed!\n");
    console.log("Test credentials (password: password123):");
    console.log("  admin@hifzhub.com   — Admin");
    console.log("  teacher@hifzhub.com — Teacher (Umar Siddiqui)");
    console.log("  ahmad@hifzhub.com   — Student (Ahmad Khan, full profile)");
    console.log("  sara@hifzhub.com    — Student (Sara Ahmed, basic profile)");
    console.log("  khalid@hifzhub.com  — Parent (Khalid Khan, Ahmad's father)");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await pool.end();
    process.exit(1);
  }

  await pool.end();
  process.exit(0);
};

seedDatabase();
