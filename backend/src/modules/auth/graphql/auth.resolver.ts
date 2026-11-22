import type { GraphQLContext } from "../../../graphql/context.js";
import {
  validateRequestPasswordResetInput, validateResetPasswordInput,
  validateGoogleSignInToken, validateSignInInput, validateSignUpInput, validateUpdateMyProfileInput,
  type ResetPasswordInput, type SignInInput, type SignUpInput,
} from "../validations/auth.validation.js";
import { authService } from "../services/authentication/auth.service.js";
import { getUserRole, requireAdmin, requireUser } from "../services/authentication/authorization.service.js";
import { isS3ProfilePictureReference } from "../utils/profile-utils/profile-picture-references.js";
import { mediaFilesUtil } from "../utils/profile-utils/media-files.util.js";

interface SignUpArgs { input: SignUpInput }
interface SignInArgs { input: SignInInput }
interface GoogleSignInArgs { idToken: unknown }

export const authResolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      return requireUser(context);
    },
    viewAllUsers: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      requireAdmin(context);
      return authService.findAll();
    }
  },

  Mutation: {
    signUp: async (_parent: unknown, args: SignUpArgs, context: GraphQLContext) => {
      const payload = await authService.signUp(validateSignUpInput(args.input));
      context.setAuthCookies(payload.user.id);
      return payload;
    },
    signIn: async (_parent: unknown, args: SignInArgs, context: GraphQLContext) => {
      const payload = await authService.signIn(validateSignInInput(args.input));
      context.setAuthCookies(payload.user.id);
      return payload;
    },
    googleSignIn: async (_parent: unknown, args: GoogleSignInArgs, context: GraphQLContext) => {
      const payload = await authService.signInWithGoogle(validateGoogleSignInToken(args.idToken));
      context.setAuthCookies(payload.user.id);
      return payload;
    },
    signOut: (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      context.clearAuthCookies();
      return true;
    },
    updateMyProfile: async (_parent: unknown, args: { input: unknown }, context: GraphQLContext) => {
      const user = requireUser(context);
      return authService.updateMyProfile(user.id, validateUpdateMyProfileInput(args.input));
    },
    completeMyProfilePictureUpload: (_parent: unknown, args: { reference: string }, context: GraphQLContext) => {
      const user = requireUser(context);
      return authService.updateMyProfilePicture(user.id, args.reference);
    },
    deleteMyAccount: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const user = requireUser(context);
      await authService.deleteMyAccount(user.id);
      context.clearAuthCookies();
      return true;
    },
    requestPasswordReset: (_parent: unknown, args: { email: string }, context: GraphQLContext) =>
      authService.requestPasswordReset(validateRequestPasswordResetInput(args).email, context.clientIp),
    resetPasswordWithOtp: (_parent: unknown, args: ResetPasswordInput) =>
      authService.resetPasswordWithOtp(validateResetPasswordInput(args)),
  },
  AuthUser: {
    profilePicture: (user: { profilePicture: string | null }) => {
      if (!user.profilePicture || !isS3ProfilePictureReference(user.profilePicture)) {
        return user.profilePicture;
      }
      return mediaFilesUtil.getProfilePictureUrl(user.profilePicture);
    },
    role: (user: { email: string }) => getUserRole(user),
    createdAt: (user: { createdAt: Date }) => user.createdAt.toISOString(),
    updatedAt: (user: { updatedAt: Date }) => user.updatedAt.toISOString(),
  },
};
