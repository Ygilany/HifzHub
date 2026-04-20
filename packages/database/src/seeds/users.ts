import type { Database } from "../client";
import { users } from "../schema";
import { hashPassword } from "../utils/password";

const TEST_USERS = [
  { email: "admin@hifzhub.com",   name: "Admin User",    role: "ADMIN"   as const },
  { email: "teacher@hifzhub.com", name: "Umar Siddiqui", role: "TEACHER" as const },
  { email: "ahmad@hifzhub.com",   name: "Ahmad Khan",    role: "STUDENT" as const },
  { email: "sara@hifzhub.com",    name: "Sara Ahmed",    role: "STUDENT" as const },
  { email: "khalid@hifzhub.com",  name: "Khalid Khan",   role: "PARENT"  as const, phone: "+1 (555) 012-3456" },
];

export const seedUsers = async (db: Database) => {
  console.log("📝 Seeding users...");

  const passwordHash = await hashPassword("password123");
  const created: Array<{ id: string; email: string; role: string; name: string }> = [];

  for (const u of TEST_USERS) {
    const existing = await db.query.users.findFirst({
      where: (t, { eq }) => eq(t.email, u.email),
    });

    if (existing) {
      console.log(`  ⏭️  ${u.email} (already exists)`);
      created.push({ id: existing.id, email: existing.email, role: existing.role, name: existing.name });
      continue;
    }

    const [newUser] = await db.insert(users).values({ ...u, passwordHash }).returning();
    if (!newUser) throw new Error(`Failed to create user: ${u.email}`);
    console.log(`  ✅ ${newUser.email} (${newUser.role})`);
    created.push({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name });
  }

  console.log("✅ Users seeded\n");
  return created;
};
