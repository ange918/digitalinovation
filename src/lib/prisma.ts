import { PrismaClient } from '@prisma/client';

/**
 * Instance Prisma unique.
 *
 * En developpement, le rechargement a chaud de Next.js re-evalue les modules a
 * chaque edition : sans ce cache global, chaque rechargement ouvrirait un
 * nouveau pool de connexions jusqu'a saturer PostgreSQL.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
