import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log("Usage: node scripts/createAdmin.mjs <email> <password>");
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 12);

const user = await prisma.user.upsert({
  where: { email },
  update: { role: "ADMIN", status: "active", passwordHash },
  create: {
    email,
    passwordHash,
    status: "active",
    role: "ADMIN",
    participantId: null,
  },
});

console.log("Admin ready:", { id: user.id, email: user.email, role: user.role });

await prisma.$disconnect();
