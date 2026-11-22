import { GraphQLError } from "graphql";
import { prisma } from "../../../../../db/client.js";
import { isUniqueEmailError, toAuthPayload } from "../../../utils/auth.util.js";
import { verifyGoogleToken } from "../google-identity.service.js";
import { assertJwtSecretConfigured } from "../auth-token.service.js";
import { publicAuthSelect } from "../../../stores/auth-fields.js";

function googleEmailConflict(): never {
  throw new GraphQLError("An account with this email already exists. Sign in with that method first.", {
    extensions: { code: "CONFLICT", http: { status: 409 } },
  });
}

function findGoogleAccountBySubject(subject: string) {
  return prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "GOOGLE",
        providerAccountId: subject,
      },
    },
    select: { auth: { select: publicAuthSelect } },
  });
}

export const googleAuthService = {
  async signInWithGoogle(idToken: string) {
    assertJwtSecretConfigured();
    const profile = await verifyGoogleToken(idToken);

    const existingGoogleAccount = await findGoogleAccountBySubject(profile.sub);
    if (existingGoogleAccount) return toAuthPayload(existingGoogleAccount.auth);

    const existingEmail = await prisma.auth.findUnique({
      where: { email: profile.email },
      select: { id: true },
    });
    if (existingEmail) googleEmailConflict();

    try {
      const user = await prisma.auth.create({
        data: {
          email: profile.email,
          fullName: profile.fullName,
          password: null,
          phone: null,
          account: {
            create: {
              provider: "GOOGLE",
              providerAccountId: profile.sub,
            },
          },
        },
        select: publicAuthSelect,
      });
      return toAuthPayload(user);
    } catch (error) {
      if (!isUniqueEmailError(error)) throw error;

      // Another request may have created this Google identity after our first lookup.
      const concurrentGoogleAccount = await findGoogleAccountBySubject(profile.sub);
      if (concurrentGoogleAccount) return toAuthPayload(concurrentGoogleAccount.auth);

      const concurrentEmailOwner = await prisma.auth.findUnique({
        where: { email: profile.email },
        select: { id: true },
      });
      if (concurrentEmailOwner) googleEmailConflict();
      throw error;
    }
  },
};
