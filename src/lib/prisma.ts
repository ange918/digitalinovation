import { PrismaClient } from '@prisma/client';

/**
 * Client Prisma partage.
 *
 * En developpement, Next.js recharge les modules a chaque edition : sans ce
 * cache global, chaque rechargement ouvrirait un nouveau pool de connexions
 * jusqu'a saturer Postgres.
 *
 * Aucun repli sur des donnees de demonstration : si la base est injoignable,
 * la requete leve. Le board administrateur decide de publier des demandes et
 * de transmettre des profils de personnes reelles — il ne doit jamais afficher
 * autre chose que l'etat reel de la base.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
