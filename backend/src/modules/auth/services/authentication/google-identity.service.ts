import { GraphQLError } from "graphql";
import { googleOAuthClient } from "../../../../shared/integrations/oauth/google.config.js";
import { normalizeEmail } from "../../validations/auth.validation.js";

function unauthenticated(): GraphQLError {
  return new GraphQLError("Google sign-in could not be verified.", {
    extensions: {
      code: "UNAUTHENTICATED",
      http: { status: 401 },
    },
  });
}

export async function verifyGoogleToken(idToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    throw new GraphQLError("Google sign-in is not configured.", {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
        http: { status: 500 },
      },
    });
  }

  const payload = await googleOAuthClient
    .verifyIdToken({ idToken, audience: clientId })
    .then((ticket) => ticket.getPayload())
    .catch(() => null);

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw unauthenticated();
  }

  const email = normalizeEmail(payload.email);
  return {
    sub: payload.sub,
    email,
    fullName: payload.name?.trim().slice(0, 100) || email.split("@")[0] || "Google user",
    hostedDomain: payload.hd ?? null,
  };
}
