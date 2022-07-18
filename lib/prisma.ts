import { Prisma, PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>;
}

let prisma: PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query"],
    });
  }
  prisma = global.prisma;

  prisma.$on("query", (e) => {
    console.log("Query: " + e.query);
    console.log("Params: " + e.params);
    console.log("Duration: " + e.duration + "ms");
  });
}

export { prisma };
