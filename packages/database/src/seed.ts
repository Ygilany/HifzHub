import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { dirname, resolve } from "path";
import pg from "pg";
import { fileURLToPath } from "url";
import { users } from "./schema";
import { hashPassword } from "./utils/password";

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from database package .env file
config({ path: resolve(__dirname, "../../../.env") });

const seedDatabase = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("🌱 Seeding database...");

  // Create database connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool);

  try {
    // Hash the password
    const password = "password123"; // Default password for seed users
    const passwordHash = await hashPassword(password);

    // Test users to create
    const testUsers = [
      {
        email: "admin@hifzhub.com",
        name: "Admin User",
        role: "ADMIN" as const,
      },
      {
        email: "teacher@hifzhub.com",
        name: "Test Teacher",
        role: "TEACHER" as const,
      },
      {
        email: "student@hifzhub.com",
        name: "Test Student",
        role: "STUDENT" as const,
      },
    ];

    console.log("Creating test users...\n");

    for (const userData of testUsers) {
      try {
        const [newUser] = await db
          .insert(users)
          .values({
            ...userData,
            passwordHash,
          })
          .onConflictDoUpdate({
            target: users.email,
            set: { name: userData.name },
          })
          .returning();

        console.log(`✅ Created: ${newUser.email} (${newUser.role})`);
      } catch (err: any) {
        if (err.code === '23505') {
          console.log(`⏭️  Already exists: ${userData.email}`);
        } else {
          throw err;
        }
      }
    }

    console.log("\n🎉 Database seeding completed!");
    console.log("\nTest credentials (all users):");
    console.log(`   Email: <user>@hifzhub.com`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await pool.end();
    process.exit(1);
  }

  await pool.end();
  process.exit(0);
};

seedDatabase();
