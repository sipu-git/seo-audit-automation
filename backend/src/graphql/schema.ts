import { authResolvers } from "../modules/auth/graphql/auth.resolver.js";
import { authTypeDefs } from "../modules/auth/graphql/auth.type-defs.js";
import { auditPreviewTypeDefs } from "../modules/audit-preview/graphql/audit-preview.type-defs.js";
import { auditPreviewResolvers } from "../modules/audit-preview/graphql/audit-preview.resolver.js";
import { auditsTypeDefs } from "../modules/audits/graphql/audits.type-defs.js";
import { auditsResolvers } from "../modules/audits/graphql/audits.resolver.js";
import { jsonScalar } from "./json.scalar.js";

const baseTypeDefs = `#graphql
  scalar JSON

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export const typeDefs = [
  baseTypeDefs,
  authTypeDefs,
  auditsTypeDefs,
  auditPreviewTypeDefs,
].join("\n");

export const resolvers = {
  JSON: jsonScalar,
  Query: {
    ...authResolvers.Query,
    ...auditsResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...auditsResolvers.Mutation,
    ...auditPreviewResolvers.Mutation,
  },
  AuthUser: authResolvers.AuthUser,
  Audit: {
    createdAt: (audit: { createdAt: Date }) => audit.createdAt.toISOString(),
    completedAt: (audit: { completedAt: Date | null }) => audit.completedAt?.toISOString() ?? null,
  },
};
