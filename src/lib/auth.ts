import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

async function sendResetPasswordEmail(user: { name: string; email: string }, url: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.info(`RESEND_API_KEY not set — no reset email sent to ${user.email}. Reset URL: ${url}`);
    return;
  }

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "1st City LLC Staff Portal <notifications@1stcityllc.example>",
        to: user.email,
        subject: "Reset your 1st City staff portal password",
        text: [
          `Hi ${user.name || "there"},`,
          "",
          "A password reset was requested for your 1st City LLC staff portal account.",
          "If you didn't request this, you can safely ignore this email — your password won't change.",
          "",
          `Reset your password: ${url}`,
          "",
          "This link expires in 1 hour.",
        ].join("\n"),
      }),
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    // Don't throw — the caller (Better Auth, or our own Server Action)
    // already told the user to check their email; a delivery failure
    // here shouldn't surface as a request error.
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    // Staff accounts are seeded (see prisma/seed.ts), not self-served —
    // this is an internal tool for a small team, not a public sign-up flow.
    disableSignUp: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail(user, url);
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  plugins: [nextCookies()],
});
