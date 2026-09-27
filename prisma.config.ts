import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js convention is `.env.local`; Prisma's CLI (outside the app) needs
// it loaded explicitly here.
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
