import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL, // .env এ থাকা URL
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter, // 👈 এখানে adapter দিলাম
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
    { emit: "event", level: "info" },
    { emit: "event", level: "warn" },
  ],
});

prisma.$on("query", (e) => {
  console.log("-------------------------------------------");
  console.log("Query: " + e.query);
  console.log("-------------------------------------------");
  console.log("Params: " + e.params);
  console.log("-------------------------------------------");
  console.log("Duration: " + e.duration + "ms");
  console.log("-------------------------------------------");
});

export default prisma;
