const BREVO_EMAIL_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export class BrevoEmailError extends Error {
  constructor(readonly status: number | null) {
    super(status === null
      ? "Brevo email request failed before a response was received."
      : `Brevo email request failed with HTTP ${status}.`);
    this.name = "BrevoEmailError";
  }
}

export function createPasswordResetEmail(code: string) {
  return {
    subject: "Your Crawlix password reset code",
    textContent: `Your Crawlix password reset code is ${code}. It expires in 5 minutes. If you did not request this, ignore this email.`,
    htmlContent: `<p>Your Crawlix password reset code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p><p>This code expires in 5 minutes. If you did not request this, ignore this email.</p>`,
  };
}

export async function sendPasswordResetEmail(email: string, code: string) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  if (!apiKey || !senderEmail) {
    throw new Error("BREVO_API_KEY and BREVO_SENDER_EMAIL must be configured.");
  }

  const message = createPasswordResetEmail(code);
  let response: Response;
  try {
    response = await fetch(BREVO_EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Crawlix", email: senderEmail },
        to: [{ email }],
        subject: message.subject,
        textContent: message.textContent,
        htmlContent: message.htmlContent,
        tags: ["password-reset"],
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new BrevoEmailError(null);
  }

  if (!response.ok) {
    throw new BrevoEmailError(response.status);
  }
}
