import { createConnection } from 'node:net';
import { PrismaClient } from '../../../prisma/generated/prisma/client';

const prisma = new PrismaClient();

function getTarget() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  const url = new URL(databaseUrl);
  const port = url.port ? Number.parseInt(url.port, 10) : 5432;
  return { host: url.hostname, port };
}

async function waitForPort(host: string, port: number) {
  const timeoutMs = process.env.DB_WAIT_CONNECT_TIMEOUT_MS
    ? Number.parseInt(process.env.DB_WAIT_CONNECT_TIMEOUT_MS, 10)
    : 1000;

  await new Promise<void>((resolve, reject) => {
    const socket = createConnection({ host, port });

    const timeout = setTimeout(() => {
      socket.destroy(new Error('Connection timeout'));
    }, timeoutMs);

    socket.once('connect', () => {
      clearTimeout(timeout);
      socket.end();
      resolve();
    });

    socket.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function waitForDb() {
  let attempts = 0;
  const maxAttempts = process.env.DB_WAIT_MAX_ATTEMPTS
    ? Number.parseInt(process.env.DB_WAIT_MAX_ATTEMPTS, 10)
    : 120;
  const { host, port } = getTarget();
  console.log(`Waiting for database at ${host}:${port}`);
  while (attempts < maxAttempts) {
    try {
      await waitForPort(host, port);
      await prisma.$connect();
      console.log('Database is ready');
      await prisma.$disconnect();
      return;
    } catch (error) {
      if (attempts + 1 >= maxAttempts) {
        console.error(error);
      } else {
        console.log('Waiting for database...');
      }
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
