import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@airose.studio"; // change if needed
  const newPassword = process.argv[2];

  if (!newPassword) {
    console.error("❌ Please provide a new password.\nUsage: npm run update-password NEWPASS");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash }, // ✅ use the correct field name
    create: {
      email,
      name: "Admin User",
      passwordHash, // ✅ fixed here too
      role: "admin",
    },
  });

  console.log(`✅ Password updated successfully for ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
