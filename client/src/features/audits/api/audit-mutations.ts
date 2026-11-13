import { gql } from "@apollo/client";
import type { AuditInput } from "@/src/features/audits/types/audit-types";

export const CREATE_AUDIT_MUTATION = gql`
  mutation CreateAudit($input: AuditInput!) {
    createAudit(input: $input) {
      jobId
      status
      statusUrl
    }
  },
`;
export const DELETE_AUDIT_MUTATION = gql`
  mutation DeleteAudit($jobId: ID!) {
    deleteAudit(jobId: $jobId)
  }
`;

export type CreateAuditMutationData = {
  createAudit: {
    jobId: string;
    status: string;
    statusUrl: string;
  };
};

export type CreateAuditMutationVariables = { input: AuditInput };
