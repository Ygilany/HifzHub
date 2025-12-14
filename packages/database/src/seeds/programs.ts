import { eq } from "drizzle-orm";
import type { Database } from "../client";
import { programs } from "../schema";

export const seedPrograms = async (db: Database) => {
  console.log("📚 Seeding programs...");

  const programData = [
    {
      name: "ICGC",
      description: "Islamic Center of Greater Cincinnati - Quran Memorization Program",
    },
    {
      name: "Orient",
      description: "Orient Islamic Center - Educational Program",
    },
  ];

  const createdPrograms: Array<{ id: string; name: string }> = [];

  for (const programInfo of programData) {
    // Check if program already exists
    const existingProgram = await db.query.programs.findFirst({
      where: eq(programs.name, programInfo.name),
    });

    if (existingProgram) {
      console.log(`  ⏭️  ${programInfo.name} (already exists)`);
      createdPrograms.push({
        id: existingProgram.id,
        name: existingProgram.name,
      });
      continue;
    }

    // Create new program
    try {
      const [newProgram] = await db
        .insert(programs)
        .values(programInfo)
        .returning();

      if (newProgram) {
        console.log(`  ✅ ${newProgram.name}`);
        createdPrograms.push({
          id: newProgram.id,
          name: newProgram.name,
        });
      }
    } catch (err: any) {
      throw new Error(`Failed to create program ${programInfo.name}: ${err.message}`);
    }
  }

  console.log("✅ Programs seeded\n");
  return createdPrograms;
};
