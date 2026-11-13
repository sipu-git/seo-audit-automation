import { GraphQLError } from "graphql";
import type { GraphQLContext } from "../../../graphql/context.js";
import {
  validateRequestPasswordResetInput, validateResetPasswordInput,
  validateSignInInput, validateSignUpInput, type ResetPasswordInput, type SignInInput, type SignUpInput,
} from "../validations/auth.validation.js";
import { authService } from "../services/auth.service.js";
import { getUserRole, requireAdmin, requireUser } from "../services/authorization.service.js";

interface SignUpArgs { input: SignUpInput }
interface SignInArgs { input: SignInInput }

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
    signOut: (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      context.clearAuthCookies();
      return true;
    },
    requestPasswordReset: (_parent: unknown, args: { email: string }, context: GraphQLContext) =>
      authService.requestPasswordReset(validateRequestPasswordResetInput(args).email, context.clientIp),
    resetPasswordWithOtp: (_parent: unknown, args: ResetPasswordInput) =>
      authService.resetPasswordWithOtp(validateResetPasswordInput(args)),
  },
  AuthUser: {
    role: (user: { email: string }) => getUserRole(user),
    createdAt: (user: { createdAt: Date }) => user.createdAt.toISOString(),
    updatedAt: (user: { updatedAt: Date }) => user.updatedAt.toISOString(),
  },
};
