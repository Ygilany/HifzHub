import { eq } from "drizzle-orm";
import type { Database } from "../client";
import { studentProfiles } from "../schema";

interface ProfileData {
  userId: string;
  currentJuz: number;
  currentSurah: number;
  currentAyah: number;
  totalAyahsMemorized: number;
  totalJuzCompleted: number;
  notes?: string;
  preferredSessionTime?: string;
}

export const seedStudentProfiles = async (
  db: Database,
  profiles: ProfileData[],
) => {
  console.log("📖 Seeding student profiles...");

  for (const p of profiles) {
    const existing = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, p.userId),
    });

    if (existing) {
      console.log(`  ⏭️  Profile for userId ${p.userId} (already exists)`);
      continue;
    }

    await db.insert(studentProfiles).values({
      userId: p.userId,
      currentJuz: p.currentJuz,
      currentSurah: p.currentSurah,
      currentAyah: p.currentAyah,
      totalAyahsMemorized: p.totalAyahsMemorized,
      totalJuzCompleted: p.totalJuzCompleted,
      notes: p.notes ?? null,
      preferredSessionTime: p.preferredSessionTime ?? null,
      enrollmentDate: new Date("2025-09-01"),
    });
    console.log(`  ✅ Profile for userId ${p.userId}`);
  }

  console.log("✅ Student profiles seeded\n");
};
