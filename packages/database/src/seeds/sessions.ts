import { and, eq } from "drizzle-orm";
import type { Database } from "../client";
import { sessions } from "../schema";

// daysAgo(n) → Date object n days before "today" (April 20 2026)
const ref = new Date("2026-04-20T10:00:00Z");
function daysAgo(n: number, hour = 10): Date {
  const d = new Date(ref);
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(hour, 0, 0, 0);
  return d;
}

// 13 sessions spread across the last 28 days (~3x/week cadence)
// Some ABSENT entries to make the heatmap look realistic.
const SESSION_TEMPLATES = [
  // date offset, type, attendance, surah range, ayahs, quality, notes
  { d: 27, type: "NEW_HIFZ",       att: "PRESENT", ss: 78, sa: 1,  es: 78, ea: 10, ayahs: 10, q: 4 },
  { d: 25, type: "RECENT_REVIEW",  att: "PRESENT", ss: 78, sa: 1,  es: 78, ea: 10, ayahs: 10, q: 4 },
  { d: 23, type: "NEW_HIFZ",       att: "PRESENT", ss: 78, sa: 11, es: 78, ea: 20, ayahs: 10, q: 3 },
  { d: 20, type: "MIXED",          att: "PRESENT", ss: 78, sa: 1,  es: 78, ea: 20, ayahs: 20, q: 4 },
  { d: 18, type: "NEW_HIFZ",       att: "PRESENT", ss: 78, sa: 21, es: 78, ea: 30, ayahs: 10, q: 5 },
  { d: 16, type: "RECENT_REVIEW",  att: "ABSENT",  ss: 78, sa: 1,  es: 78, ea: 30, ayahs:  0, q: null },
  { d: 14, type: "NEW_HIFZ",       att: "PRESENT", ss: 78, sa: 31, es: 78, ea: 40, ayahs: 10, q: 4 },
  { d: 11, type: "MIXED",          att: "PRESENT", ss: 78, sa: 1,  es: 78, ea: 40, ayahs: 40, q: 3 },
  { d:  9, type: "NEW_HIFZ",       att: "PRESENT", ss: 79, sa: 1,  es: 79, ea: 10, ayahs: 10, q: 4 },
  { d:  7, type: "RECENT_REVIEW",  att: "PRESENT", ss: 79, sa: 1,  es: 79, ea: 10, ayahs: 10, q: 5 },
  { d:  4, type: "NEW_HIFZ",       att: "PRESENT", ss: 79, sa: 11, es: 79, ea: 20, ayahs: 10, q: 4 },
  { d:  2, type: "MIXED",          att: "PRESENT", ss: 79, sa: 1,  es: 79, ea: 20, ayahs: 20, q: 4 },
  { d:  0, type: "NEW_HIFZ",       att: "PRESENT", ss: 67, sa: 1,  es: 67, ea:  5, ayahs:  5, q: 4 },
] as const;

const NOTES: Record<number, string> = {
  27: "Good start, working on An-Naba.",
  23: "Smooth recitation, minor tashkeel errors.",
  14: "Excellent progress, completed An-Naba.",
  9:  "Started An-Naziat, strong memorization.",
  0:  "Started Al-Mulk today, good tajweed.",
};

export const seedSessions = async (
  db: Database,
  studentId: string,
  teacherId: string,
  classId: string,
): Promise<Array<{ id: string; dayOffset: number }>> => {
  console.log("📅 Seeding sessions...");

  const results: Array<{ id: string; dayOffset: number }> = [];

  for (const t of SESSION_TEMPLATES) {
    const sessionDate = daysAgo(t.d);

    // Idempotency: skip if a session on this exact date already exists for student
    const existing = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.studentId, studentId),
        eq(sessions.sessionDate, sessionDate),
      ),
    });

    if (existing) {
      console.log(`  ⏭️  Session on ${sessionDate.toDateString()} (already exists)`);
      results.push({ id: existing.id, dayOffset: t.d });
      continue;
    }

    const [row] = await db.insert(sessions).values({
      studentId,
      teacherId,
      classId,
      sessionDate,
      sessionType: t.type,
      attendanceStatus: t.att,
      durationMinutes: t.att === "ABSENT" ? null : 45,
      startSurah: t.ss,
      startAyah: t.sa,
      endSurah: t.es,
      endAyah: t.ea,
      ayahsCovered: t.ayahs > 0 ? t.ayahs : null,
      qualityRating: t.q ?? null,
      teacherNotes: NOTES[t.d] ?? null,
    }).returning();

    if (!row) throw new Error(`Failed to insert session at day offset ${t.d}`);
    console.log(`  ✅ ${t.att} · ${sessionDate.toDateString()} (${t.type})`);
    results.push({ id: row.id, dayOffset: t.d });
  }

  console.log("✅ Sessions seeded\n");
  return results;
};
