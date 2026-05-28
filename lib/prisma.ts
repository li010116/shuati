import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// Run asynchronous self-healing/normalization for historical import data
if (typeof window === "undefined") {
  (async () => {
    try {
      // Normalize difficulty column values
      await prisma.question.updateMany({
        where: { difficulty: { in: ["低", "低难度"] } },
        data: { difficulty: "简单" }
      });
      await prisma.question.updateMany({
        where: { difficulty: { in: ["中", "中等", "中等难度", "中难度"] } },
        data: { difficulty: "普通" }
      });
      await prisma.question.updateMany({
        where: { difficulty: { in: ["高", "高难度"] } },
        data: { difficulty: "困难" }
      });

      // Normalize importance column values
      await prisma.question.updateMany({
        where: { importance: { in: ["了解", "低"] } },
        data: { importance: "普通" }
      });
      await prisma.question.updateMany({
        where: { importance: { in: ["较重要", "重点"] } },
        data: { importance: "重要" }
      });
      await prisma.question.updateMany({
        where: { importance: { in: ["必会", "核心"] } },
        data: { importance: "极为重要" }
      });
    } catch (e) {
      console.warn("PRISMA INITIALIZATION DATA REPAIR WARNING:", e);
    }
  })();
}

