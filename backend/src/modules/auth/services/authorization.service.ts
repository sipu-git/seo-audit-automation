import { GraphQLError } from "graphql";
import type { AuthenticatedUser, GraphQLContext } from "../../../graphql/context.js";

export type UserRole = "CLIENT" | "ADMIN";

export function getUserRole(user: Pick<AuthenticatedUser, "email">): UserRole {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(user.email.toLowerCase()) ? "ADMIN" : "CLIENT";
}

export function requireUser(context: GraphQLContext): AuthenticatedUser {
  if (!context.user) {
    throw new GraphQLError("Sign in to continue.", {
      extensions: { code: "UNAUTHENTICATED", http: { status: 401 } },
    });
  }
  return context.user;
}

export function requireAdmin(context: GraphQLContext): AuthenticatedUser {
  const user = requireUser(context);
  if (getUserRole(user) !== "ADMIN") {
    throw new GraphQLError("Administrator access is required.", {
      extensions: { code: "FORBIDDEN", http: { status: 403 } },
    });
  }
  return user;
}
