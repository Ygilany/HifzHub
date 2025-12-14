import { and, eq } from "drizzle-orm";
import type { Database } from "../client";
import { classes } from "../schema";

export const seedClasses = async (
  db: Database,
  programId: string,
  className: string = "Beginner Class"
) => {
  console.log("🏫 Seeding classes...");

  // Check if class already exists
  const existingClass = await db.query.classes.findFirst({
    where: and(
      eq(classes.programId, programId),
      eq(classes.name, className)
    ),
  });

  if (existingClass) {
    console.log(`  ⏭️  ${className} (already exists)`);
    console.log("✅ Classes seeded\n");
    return existingClass;
  }

  // Create new class
  try {
    const [newClass] = await db
      .insert(classes)
      .values({
        programId,
        name: className,
        description: `Class for ${className} in the program`,
      })
      .returning();

    if (newClass) {
      console.log(`  ✅ ${newClass.name}`);
      console.log("✅ Classes seeded\n");
      return newClass;
    }
  } catch (err: any) {
    throw new Error(`Failed to create class: ${err.message}`);
  }

  throw new Error("Failed to create or find class");
};
