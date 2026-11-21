import { GraphQLError } from "graphql";
import { prisma } from "../../../../db/client.js";
import type { SignInInput, SignUpInput, UpdateMyProfileInput } from "../../validations/auth.validation.js";
import { assertJwtSecretConfigured } from "./auth-token.service.js";
import { hashPassword, isBcryptPasswordHash, verifyPassword } from "../password-recovery/password.service.js";
import { verifyLegacyPassword } from "../password-recovery/legacy-password.service.js";
import { createAuth, isUniqueEmailError, toAuthPayload } from "../../utils/auth.util.js";
import { requestPasswordReset, resetPasswordWithOtp } from "../password-recovery/password-reset.service.js";
import { isProfilePictureContentType, mediaFilesUtil } from "../../utils/profile-utils/media-files.util.js";
import { isProfilePictureReferenceForUser } from "../../utils/profile-utils/profile-picture-references.js";

export const authService = {
  findAuthByEmail(email: string) {
    return prisma.auth.findUnique({ where: { email } });
  },
  findPublicAuthById(id: string) {
    return prisma.auth.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  findAll(userId?: string) {
    return prisma.auth.findMany({
      where: userId ? { id: userId } : undefined,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async updateMyProfile(userId: string, input: UpdateMyProfileInput) {
    try {
      return await prisma.auth.update({
        where: { id: userId },
        data: {
          fullName: input.fullName,
          email: input.email,
          phone: input.phone ?? null,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          profilePicture: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if (isUniqueEmailError(error)) {
        throw new GraphQLError("An account with that email already exists.", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: { status: 400 },
          },
        });
      }
      throw error;
    }
  },

  async uploadMyProfilePicture(userId: string, contentType: string, image: Buffer) {
    if (!isProfilePictureContentType(contentType)) {
      throw new GraphQLError("Choose a JPEG, PNG, or WebP image.", {
        extensions: { code: "BAD_USER_INPUT", http: { status: 400 } },
      });
    }
    if (image.byteLength < 1 || image.byteLength > 5 * 1024 * 1024) {
      throw new GraphQLError("The profile picture must be larger than 0 bytes and 5 MB or smaller.", {
        extensions: { code: "BAD_USER_INPUT", http: { status: 400 } },
      });
    }

    return mediaFilesUtil.uploadProfilePictureToS3(userId, contentType, image);
  },

  async updateMyProfilePicture(userId: string, reference: string) {
    if (!isProfilePictureReferenceForUser(reference, userId)) {
      throw new GraphQLError("Invalid profile picture upload reference.", {
        extensions: { code: "BAD_USER_INPUT", http: { status: 400 } },
      });
    }

    return prisma.auth.update({
      where: { id: userId },
      data: { profilePicture: reference },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async deleteMyAccount(userId: string) {
    await prisma.auth.delete({ where: { id: userId } });
    return true;
  },

  async signUp(input: SignUpInput) {
    assertJwtSecretConfigured();
    const password = await hashPassword(input.password);
    try {
      const user = await createAuth({ ...input, password, phone: input.phone ?? null });
      return toAuthPayload(user);
    } catch (error) {
      if (isUniqueEmailError(error)) {
        throw new GraphQLError("An account with that email already exists.", {
          extensions: { code: "BAD_USER_INPUT", http: { status: 400 } },
        });
      }
      throw error;
    }
  },

  async signIn(input: SignInInput) {
    assertJwtSecretConfigured();
    const user = await this.findAuthByEmail(input.email);
    if (!user) {
      throw new GraphQLError("Email or password is incorrect.", {
        extensions: { code: "UNAUTHENTICATED", http: { status: 401 } },
      });
    }

    const bcryptHash = isBcryptPasswordHash(user.password);
    const passwordMatches = bcryptHash
      ? await verifyPassword(input.password, user.password)
      : await verifyLegacyPassword(input.password, user.password);
    if (!passwordMatches) {
      throw new GraphQLError("Email or password is incorrect.", {
        extensions: { code: "UNAUTHENTICATED", http: { status: 401 } },
      });
    }

    if (!bcryptHash && Buffer.byteLength(input.password, "utf8") <= 72) {
      await prisma.auth.update({
        where: { id: user.id },
        data: { password: await hashPassword(input.password) },
      });
    }

    return toAuthPayload(user);
  },

  requestPasswordReset(email: string, clientIp: string) {
    return requestPasswordReset(email, clientIp);
  },

  resetPasswordWithOtp(input: { email: string; code: string; newPassword: string }) {
    return resetPasswordWithOtp(input);
  },
}
