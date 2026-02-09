import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Lazy initialization function to avoid build-time crashes
export function getPrisma() {
  if (typeof window !== 'undefined') return {} as PrismaClient;
  
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

// Polyfill to handle BigInt serialization in JSON
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
