import type { Database } from "../client";
import { users } from "../schema";
import { hashPassword } from "../utils/password";

export const seedUsers = async (db: Database) => {
  console.log("📝 Seeding users...");

  const password = "password123"; // Default password for seed users
  const passwordHash = await hashPassword(password);

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

  const createdUsers: Array<{ id: string; email: string; role: string }> = [];

  for (const userData of testUsers) {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, userData.email),
    });

    if (existingUser) {
      console.log(`  ⏭️  ${userData.email} (already exists)`);
      createdUsers.push({
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      });
      continue;
    }

    // Create new user
    try {
      const [newUser] = await db
        .insert(users)
        .values({
          ...userData,
          passwordHash,
        })
        .returning();

      if (newUser) {
        console.log(`  ✅ ${newUser.email} (${newUser.role})`);
        createdUsers.push({
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
        });
      } else {
        throw new Error(`Failed to create user: ${userData.email}`);
      }
    } catch (err: any) {
      throw new Error(`Failed to create user ${userData.email}: ${err.message}`);
    }
  }

  console.log("✅ Users seeded\n");
  return createdUsers;
};
