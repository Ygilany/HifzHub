import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { Database } from "../client";
import { wordMistakes } from "../schema";

// A realistic batch of mistakes on pages 603–604 (An-Naba region)
const MISTAKES = [
  // page, line, word, text,           type
  { p: 603, l: 2,  w: 3,  t: "وَالنَّازِعَاتِ", type: "tashkeel" },
  { p: 603, l: 2,  w: 7,  t: "غَرْقًا",          type: "memory"   },
  { p: 603, l: 5,  w: 1,  t: "وَالسَّابِحَاتِ",  type: "tajweed"  },
  { p: 603, l: 8,  w: 4,  t: "يَتَذَكَّرُ",       type: "tashkeel" },
  { p: 603, l: 11, w: 2,  t: "الطَّامَّةُ",       type: "memory"   },
  { p: 604, l: 1,  w: 5,  t: "فَأَمَّا",           type: "tajweed"  },
  { p: 604, l: 3,  w: 3,  t: "الْجَحِيمَ",        type: "tashkeel" },
  { p: 604, l: 6,  w: 1,  t: "وَأَمَّا",           type: "memory"   },
  { p: 604, l: 9,  w: 4,  t: "الْمَأْوَىٰ",        type: "tajweed"  },
];

export const seedWordMistakes = async (
  db: Database,
  studentId: string,
  teacherId: string,
) => {
  console.log("🔴 Seeding word mistakes...");

  // Skip if already seeded for this student
  const existing = await db.query.wordMistakes.findFirst({
    where: eq(wordMistakes.studentId, studentId),
  });

  if (existing) {
    console.log("  ⏭️  Word mistakes batch (already exists)");
    console.log("✅ Word mistakes seeded\n");
    return;
  }

  const batchId = randomUUID();
  const recordedAt = new Date("2026-04-18T11:30:00Z");

  await db.insert(wordMistakes).values(
    MISTAKES.map((m) => ({
      batchId,
      studentId,
      teacherId,
      pageIndex: m.p,
      lineIndex: m.l,
      wordIndex: m.w,
      wordText: m.t,
      mistakeType: m.type,
      recordedAt,
    })),
  );

  console.log(`  ✅ ${MISTAKES.length} word mistakes (batchId: ${batchId})`);
  console.log("✅ Word mistakes seeded\n");
};
