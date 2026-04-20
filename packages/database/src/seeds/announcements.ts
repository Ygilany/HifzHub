import { eq } from "drizzle-orm";
import type { Database } from "../client";
import { announcements } from "../schema";

export const seedAnnouncements = async (
  db: Database,
  teacherId: string,
  programId: string,
  classId: string,
) => {
  console.log("📢 Seeding announcements...");

  const existing = await db.query.announcements.findFirst({
    where: eq(announcements.teacherId, teacherId),
  });

  if (existing) {
    console.log("  ⏭️  Announcements (already exist)");
    console.log("✅ Announcements seeded\n");
    return;
  }

  const announcementDefs = [
    {
      programId,
      classId,
      teacherId,
      title: "Term 2 Schedule Update",
      body: "As-salamu alaykum parents and students. A reminder that Term 2 sessions resume on Monday, April 21. Please ensure your child has reviewed their assigned pages before the session. JazakAllah khayran.",
      createdAt: new Date("2026-04-17T09:00:00Z"),
    },
    {
      programId,
      classId: null,
      teacherId,
      title: "Quran Recitation Night — May 3rd",
      body: "We are hosting our annual Quran Recitation Night on Saturday, May 3rd at 7 PM. All students who have completed at least one juz are invited to recite. Please confirm your attendance with the office by April 28th.",
      createdAt: new Date("2026-04-14T14:00:00Z"),
    },
    {
      programId,
      classId,
      teacherId,
      title: "Homework Check-In Reminder",
      body: "Parents, please remember to confirm your child's daily revision in the app. The check-in only takes a moment and helps us track consistency between sessions. Thank you for your support!",
      createdAt: new Date("2026-04-10T08:30:00Z"),
    },
  ];

  for (const a of announcementDefs) {
    await db.insert(announcements).values(a);
    console.log(`  ✅ "${a.title}"`);
  }

  console.log("✅ Announcements seeded\n");
};
