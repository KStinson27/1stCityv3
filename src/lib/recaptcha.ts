async function verifyRecaptcha(token: string | undefined, secretKey: string): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secretKey, response: token }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (error) {
    console.error("Failed to verify reCAPTCHA:", error);
    return false;
  }
}

/**
 * Verifies a reCAPTCHA token when RECAPTCHA_SECRET_KEY is configured;
 * returns true (pass) when it isn't, matching the rest of this app's
 * graceful-degradation pattern for optional third-party integrations.
 */
export async function checkRecaptcha(token: string | undefined): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) return true;
  return verifyRecaptcha(token, secretKey);
}
