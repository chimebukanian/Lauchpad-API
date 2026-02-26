const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
// Instantiate PrismaClient normally; datasource URL comes from schema/.env
const prisma = new PrismaClient();

async function main() {
  const pw = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@launchpad.com' },
    update: {},
    create: { email: 'admin@launchpad.com', password: pw, role: 'ADMIN' },
  });
  console.log('admin user created');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
