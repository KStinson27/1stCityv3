/**
 * Seeds the initial staff account(s) for /admin.
 *
 * Admin accounts are not self-service (see src/lib/auth.ts —
 * `disableSignUp: true`), so this script is how a staff login gets
 * created: insert the User + credential Account rows directly, with
 * the password hashed the same way Better Auth hashes it, bypassing
 * the (disabled) public sign-up endpoint entirely.
 *
 * Usage:
 *   ADMIN_SEED_EMAIL=you@1stcityllc.example ADMIN_SEED_PASSWORD=... \
 *     npm run db:seed
 *
 * Defaults to a documented dev-only account if those aren't set —
 * fine for local testing, not for anything real. Re-running is safe;
 * an existing account is left untouched.
 *
 * The dynamic imports below are deliberate: `dotenv` has to load
 * `.env.local` *before* `src/lib/prisma.ts` first reads
 * `process.env.DATABASE_URL` at module scope, and static ESM imports
 * are hoisted above this file's own code, so a static import of prisma
 * would run before config() does.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { hashPassword } = await import("better-auth/crypto");
  const { prisma } = await import("../src/lib/prisma");

  const email = process.env.ADMIN_SEED_EMAIL ?? "admin@1stcityllc.example";
  const password = process.env.ADMIN_SEED_PASSWORD ?? "dev-only-password-123";
  const name = process.env.ADMIN_SEED_NAME ?? "Staff Admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin account already exists for ${email} — skipping.`);
    await prisma.$disconnect();
    return;
  }

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name,
      email,
      emailVerified: true,
    },
  });

  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      userId: user.id,
      // Better Auth's credential sign-in looks up the account by
      // `accountId === user.id` (not the email) — see
      // node_modules/better-auth/dist/api/routes/sign-in.mjs.
      accountId: user.id,
      providerId: "credential",
      password: await hashPassword(password),
    },
  });

  console.log(`Created admin account: ${email}`);
  if (!process.env.ADMIN_SEED_PASSWORD) {
    console.log(`Dev password: ${password} (set ADMIN_SEED_PASSWORD for a real one)`);
  }
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
