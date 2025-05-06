import { PrismaClient } from '../../../prisma/generated/prisma/client';

const prisma = new PrismaClient();

async function waitForDb() {
  let attempts = 0;
  const maxAttempts = 30; // Максимум 30 секунд ожидания
  while (attempts < maxAttempts) {
    try {
      await prisma.$connect();
      console.log('Database is ready');
      await prisma.$disconnect();
      return;
    } catch (error) {
      console.log('Waiting for database...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }
  }
  throw new Error('Database did not become available in time');
}

waitForDb()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
