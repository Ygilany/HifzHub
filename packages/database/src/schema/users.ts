import { pgTable, uuid, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";

// User role enum
export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "TEACHER",
  "ASSISTANT",
  "STUDENT",
  "PARENT",
]);

// Users table - Core authentication and profile data
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull(),
  passwordHash: varchar("password_hash", { length: 255 }),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Type exports for use in application code
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
