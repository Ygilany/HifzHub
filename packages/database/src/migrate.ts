import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { config } from "dotenv";
import { resolve } from "path";

const { Pool } = pg;

// Load environment variables from root .env file
config({ path: resolve(process.cwd(), "../../.env") });

const runMigrations = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("Running migrations...");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  await migrate(db, {
    migrationsFolder: "./drizzle/migrations",
  });

  await pool.end();

  console.log("Migrations completed successfully!");
};

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
