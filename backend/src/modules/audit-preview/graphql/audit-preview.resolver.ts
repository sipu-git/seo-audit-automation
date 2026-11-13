import { auditPreviewHandler } from "../services/audit-preview-operation.service.js";
import {
  validateAuditPreview,
  type AuditPreviewInputArgs,
} from "../validations/audit-preview-operation.validation.js";
import type { GraphQLContext } from "../../../graphql/context.js";
import { requireUser } from "../../auth/services/authorization.service.js";

export const auditPreviewResolvers = {
  Mutation: {
    auditPreview: (_parent: unknown, args: AuditPreviewInputArgs, context: GraphQLContext) => {
      requireUser(context);
      return auditPreviewHandler(validateAuditPreview(args));
    },
  },
};
