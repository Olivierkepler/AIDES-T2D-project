import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const studyCode = process.argv[2];
const emailAllowed = process.argv[3] || null;

if (!studyCode) {
  console.log("Usage: node scripts/createInvite.mjs <STUDY_CODE> [emailAllowed]");
  process.exit(1);
}

await prisma.inviteKey.create({
  data: { studyCode, emailAllowed },
});

console.log("Created InviteKey:", { studyCode, emailAllowed });

await prisma.$disconnect();
