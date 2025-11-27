import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { users } from "./schema";
import { hashPassword } from "./utils/password";

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from database package .env file
config({ path: resolve(__dirname, "../.env") });

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
    const password = "admin123"; // Default password for seed user
    const passwordHash = await hashPassword(password);

    // Insert a test user
    const [newUser] = await db
      .insert(users)
      .values({
        email: "admin@hifzhub.com",
        name: "Admin User",
        role: "ADMIN",
        passwordHash,
      })
      .returning();

    console.log("✅ Successfully created test user:");
    console.log("   Email:", newUser.email);
    console.log("   Password:", password);
    console.log("   Name:", newUser.name);
    console.log("   Role:", newUser.role);
    console.log("   ID:", newUser.id);

    console.log("\n🎉 Database seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await pool.end();
    process.exit(1);
  }

  await pool.end();
  process.exit(0);
};

seedDatabase();
