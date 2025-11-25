import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Manually define enum values as fallback for ESM (avoids import ambiguity)
const RoleEnum = {
  admin: "admin",
  manager: "manager",
  project_manager: "project_manager",
  supervisor: "supervisor",
  driver: "driver",
  maintenance: "maintenance",
};

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  const users = [
    {
      name: "Admin",
      email: "admin@maqayees.com",
      password: hashedPassword,
      role: RoleEnum.admin,
    },
    {
      name: "Ali Manager",
      email: "manager@maqayees.com",
      password: hashedPassword,
      role: RoleEnum.manager,
    },
    {
      name: "Sara Project Manager",
      email: "pm@maqayees.com",
      password: hashedPassword,
      role: RoleEnum.project_manager,
    },
    {
      name: "Omar Supervisor",
      email: "supervisor@maqayees.com",
      password: hashedPassword,
      role: RoleEnum.supervisor,
    },
    {
      name: "Ahmed Driver",
      email: "driver@maqayees.com",
      password: hashedPassword,
      role: RoleEnum.driver,
    },
    {
      name: "Basil",
      email: "maintenance@maqayees.com",
      password: hashedPassword,
      role: RoleEnum.maintenance,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log("✅ All roles and users seeded successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
