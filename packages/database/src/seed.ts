import { config } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { db, pool } from "./client";
import { seedClasses } from "./seeds/classes";
import { seedPrograms } from "./seeds/programs";
import { seedRelationships } from "./seeds/relationships";
import { seedUsers } from "./seeds/users";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from monorepo root
config({ path: resolve(__dirname, "../../../.env") });

const seedDatabase = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("🌱 Seeding database...\n");

  try {
    // 1. Seed users
    const users = await seedUsers(db);
    const teacher = users.find((u) => u.role === "TEACHER");
    const student = users.find((u) => u.role === "STUDENT");

    if (!teacher) {
      throw new Error("Teacher user not found after seeding");
    }
    if (!student) {
      throw new Error("Student user not found after seeding");
    }

    // 2. Seed programs
    const seededPrograms = await seedPrograms(db);
    const icgcProgram = seededPrograms.find((p) => p.name === "ICGC");

    if (!icgcProgram) {
      throw new Error("ICGC program not found after seeding");
    }

    // 3. Seed class in first program (ICGC)
    const classData = await seedClasses(db, icgcProgram.id, "Beginner Class");

    // 4. Seed relationships
    await seedRelationships(db, {
      teacherId: teacher.id,
      studentId: student.id,
      programId: icgcProgram.id,
      classId: classData.id,
    });

    console.log("🎉 Database seeding completed!");
    console.log("\nTest credentials (all users):");
    console.log(`   Email: <user>@hifzhub.com`);
    console.log(`   Password: password123`);
    console.log("\n📊 Seeded data:");
    console.log(`   Programs: ${seededPrograms.map((p) => p.name).join(", ")}`);
    console.log(`   Teacher (${teacher.email}) → Program: ${icgcProgram.name}`);
    console.log(`   Student (${student.email}) → Program: ${icgcProgram.name}`);
    console.log(`   Student (${student.email}) → Class: ${classData.name}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await pool.end();
    process.exit(1);
  }

  await pool.end();
  process.exit(0);
};

seedDatabase();
