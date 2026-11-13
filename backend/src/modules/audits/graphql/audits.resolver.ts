import { createAuditHandler, deleteAuditHandler } from "../services/create-audit.service.js";
import {
  getAuditListHandler,
  getAuditsHandler,
  getAuditStatusHandler,
} from "../services/audits-queries.service.js";
import {
  validateCreateAudit,
  type CreateAuditInput,
} from "../validations/create-audit.validation.js";
import {
  validateGetAuditListQuery,
  type GetAuditListQuery,
} from "../validations/audits.validation.js";
import {
  validateGetAuditsQuery,
  validateGetAuditStatusQuery,
} from "../validations/audits.validation.js";
import type { GraphQLContext } from "../../../graphql/context.js";
import { getUserRole, requireUser } from "../../auth/services/authorization.service.js";
import { prisma } from "../../../db/client.js";
import { GraphQLError } from "graphql";

export const auditsResolvers = {
  Query: {
    audits: (_parent: unknown, args: { limit?: number }, context: GraphQLContext) => {
      const user = requireUser(context);
      return getAuditsHandler(
        validateGetAuditsQuery(args),
        getUserRole(user) === "ADMIN" ? undefined : user.id,
      );
    },
    auditList: (_parent: unknown, args: GetAuditListQuery, context: GraphQLContext) => {
      const user = requireUser(context);
      return getAuditListHandler(
        validateGetAuditListQuery(args),
        getUserRole(user) === "ADMIN" ? undefined : user.id,
      );
    },
    auditStatus: async (_parent: unknown, args: { jobId: string }, context: GraphQLContext) => {
      const user = requireUser(context);
      const jobId = validateGetAuditStatusQuery(args);
      const audit = await prisma.audit.findUnique({ where: { jobId }, select: { created_by: true } });
      if (audit && getUserRole(user) !== "ADMIN" && audit.created_by !== user.id) {
        throw new GraphQLError("You cannot view this audit.", { extensions: { code: "FORBIDDEN", http: { status: 403 } } });
      }
      return getAuditStatusHandler(jobId);
    },
  },
  Mutation: {
    createAudit: (_parent: unknown, args: CreateAuditInput, context: GraphQLContext) =>
      createAuditHandler(validateCreateAudit(args), requireUser(context).id),
    deleteAudit: (_parent: unknown, args: { jobId: string }, context: GraphQLContext) =>
      deleteAuditHandler(args.jobId, requireUser(context).id),
  },
};
