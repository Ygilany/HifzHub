import { and, eq } from "drizzle-orm";
import type { Database } from "../client";
import { studentGoals } from "../schema";

export const seedGoals = async (
  db: Database,
  studentId: string,
  teacherId: string,
) => {
  console.log("🎯 Seeding goals...");

  const goalDefs = [
    {
      type: "SEMESTER" as const,
      title: "Complete Juz 30",
      description: "Memorize all of Juz 30 (An-Naba to An-Nas) by end of spring semester.",
      targetJuz: 30,
      targetAyahs: 564,
      currentProgress: 200,
      status: "IN_PROGRESS" as const,
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-06-30"),
    },
    {
      type: "ANNUAL" as const,
      title: "Complete Juz 29–30",
      description: "Full memorization of the last two juz by year end.",
      targetJuz: 29,
      targetAyahs: 1200,
      currentProgress: 200,
      status: "IN_PROGRESS" as const,
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
    },
  ];

  for (const g of goalDefs) {
    const existing = await db.query.studentGoals.findFirst({
      where: and(
        eq(studentGoals.studentId, studentId),
        eq(studentGoals.type, g.type),
      ),
    });

    if (existing) {
      console.log(`  ⏭️  ${g.type} goal (already exists)`);
      continue;
    }

    await db.insert(studentGoals).values({
      studentId,
      createdById: teacherId,
      ...g,
    });
    console.log(`  ✅ ${g.type} — ${g.title}`);
  }

  console.log("✅ Goals seeded\n");
};
