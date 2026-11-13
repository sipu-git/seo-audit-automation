import { gql } from "@apollo/client";
import type {
  AuditJobStatus,
  AuditRow,
} from "@/src/features/audits/types/audit-types";

export const AUDITS_QUERY = gql`
  query Audits($limit: Int) {
    audits(limit: $limit) {
      id
      jobId
      url
      businessType
      city
      state
      status
      progress
      overallScore
      dataSources
      signals
      analysis
      note
      reportAvailable
      error
      createdAt
      completedAt
    }
  }
`;

export const AUDIT_LIST_QUERY = gql`
  query AuditList($page: Int!, $pageSize: Int!, $search: String!, $status: String!) {
    auditList(page: $page, pageSize: $pageSize, search: $search, status: $status) {
      items {
        id
        jobId
        url
        businessType
        city
        state
        status
        progress
        overallScore
        dataSources
        signals
        analysis
        note
        reportAvailable
        error
        createdAt
        completedAt
      }
      totalCount
      page
      pageSize
      totalPages
      summary {
        total
        completed
        active
        failed
        averageScore
      }
    }
  }
`;

export const AUDIT_STATUS_QUERY = gql`
  query AuditStatus($jobId: ID!) {
    auditStatus(jobId: $jobId) {
      jobId
      state
      progress
      result
      error
    }
  }
`;

export type AuditsQueryData = { audits: AuditRow[] };
export type AuditsQueryVariables = { limit: number };
export type AuditListSummary = {
  total: number;
  completed: number;
  active: number;
  failed: number;
  averageScore: number | null;
};
export type AuditListQueryData = {
  auditList: {
    items: AuditRow[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    summary: AuditListSummary;
  };
};
export type AuditListQueryVariables = {
  page: number;
  pageSize: number;
  search: string;
  status: string;
};
export type AuditStatusQueryData = {
  auditStatus: AuditJobStatus | null;
};
export type AuditStatusQueryVariables = { jobId: string };
