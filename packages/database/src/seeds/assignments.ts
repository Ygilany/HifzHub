import { eq } from "drizzle-orm";
import type { Database } from "../client";
import { assignments } from "../schema";

// One assignment per session (keyed by day offset from sessions seed)
const ASSIGNMENT_TEMPLATES: Array<{
  dayOffset: number;
  type: "NEW_MEMORIZATION" | "RECENT_REVISION" | "DISTANT_REVISION";
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "INCOMPLETE";
  ss: number; sa: number; es: number; ea: number; ayahCount: number;
  grade?: number;
}> = [
  { dayOffset: 27, type: "NEW_MEMORIZATION", status: "COMPLETED",   ss: 78, sa: 1,  es: 78, ea: 10, ayahCount: 10, grade: 4 },
  { dayOffset: 25, type: "RECENT_REVISION",  status: "COMPLETED",   ss: 78, sa: 1,  es: 78, ea: 10, ayahCount: 10, grade: 4 },
  { dayOffset: 23, type: "NEW_MEMORIZATION", status: "COMPLETED",   ss: 78, sa: 11, es: 78, ea: 20, ayahCount: 10, grade: 3 },
  { dayOffset: 20, type: "DISTANT_REVISION", status: "COMPLETED",   ss: 78, sa: 1,  es: 78, ea: 20, ayahCount: 20, grade: 4 },
  { dayOffset: 18, type: "NEW_MEMORIZATION", status: "COMPLETED",   ss: 78, sa: 21, es: 78, ea: 30, ayahCount: 10, grade: 5 },
  { dayOffset: 14, type: "NEW_MEMORIZATION", status: "COMPLETED",   ss: 78, sa: 31, es: 78, ea: 40, ayahCount: 10, grade: 4 },
  { dayOffset: 11, type: "DISTANT_REVISION", status: "COMPLETED",   ss: 78, sa: 1,  es: 78, ea: 40, ayahCount: 40, grade: 3 },
  { dayOffset:  9, type: "NEW_MEMORIZATION", status: "COMPLETED",   ss: 79, sa: 1,  es: 79, ea: 10, ayahCount: 10, grade: 4 },
  { dayOffset:  7, type: "RECENT_REVISION",  status: "COMPLETED",   ss: 79, sa: 1,  es: 79, ea: 10, ayahCount: 10, grade: 5 },
  { dayOffset:  4, type: "NEW_MEMORIZATION", status: "COMPLETED",   ss: 79, sa: 11, es: 79, ea: 20, ayahCount: 10, grade: 4 },
  { dayOffset:  2, type: "RECENT_REVISION",  status: "IN_PROGRESS", ss: 79, sa: 1,  es: 79, ea: 20, ayahCount: 20 },
  { dayOffset:  0, type: "NEW_MEMORIZATION", status: "IN_PROGRESS", ss: 67, sa: 1,  es: 67, ea:  5, ayahCount:  5 },
];

export const seedAssignments = async (
  db: Database,
  studentId: string,
  sessionMap: Map<number, string>, // dayOffset → sessionId
) => {
  console.log("📋 Seeding assignments...");

  for (const t of ASSIGNMENT_TEMPLATES) {
    const sessionId = sessionMap.get(t.dayOffset);
    if (!sessionId) continue;

    const existing = await db.query.assignments.findFirst({
      where: eq(assignments.sessionId, sessionId),
    });

    if (existing) {
      console.log(`  ⏭️  Assignment for session day -${t.dayOffset} (already exists)`);
      continue;
    }

    await db.insert(assignments).values({
      sessionId,
      studentId,
      type: t.type,
      status: t.status,
      startSurah: t.ss,
      startAyah: t.sa,
      endSurah: t.es,
      endAyah: t.ea,
      ayahCount: t.ayahCount,
      grade: t.grade ?? null,
    });
    console.log(`  ✅ ${t.type} · S${t.ss}:${t.sa}–S${t.es}:${t.ea}`);
  }

  console.log("✅ Assignments seeded\n");
};
