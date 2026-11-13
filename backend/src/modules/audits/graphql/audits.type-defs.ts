export const auditsTypeDefs = `#graphql
  input AuditInput {
    url: String!
    businessType: String!
    city: String!
    state: String!
  }

  type QueuedAudit {
    jobId: ID!
    status: String!
    statusUrl: String!
  }

  type Audit {
    id: ID!
    jobId: ID!
    url: String!
    businessType: String!
    city: String!
    state: String!
    status: String!
    progress: Float!
    overallScore: Int
    dataSources: JSON
    signals: JSON
    analysis: JSON
    note: String
    reportAvailable: Boolean!
    error: String
    createdAt: String!
    completedAt: String
  }

  type AuditJobStatus {
    jobId: ID!
    state: String!
    progress: Float!
    result: JSON
    error: String
  }

  type AuditListSummary {
    total: Int!
    completed: Int!
    active: Int!
    failed: Int!
    averageScore: Float
  }

  type AuditListPage {
    items: [Audit!]!
    totalCount: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
    summary: AuditListSummary!
  }

  extend type Query {
    audits(limit: Int): [Audit!]!
    auditList(page: Int, pageSize: Int, search: String, status: String): AuditListPage!
    auditStatus(jobId: ID!): AuditJobStatus
  }

  extend type Mutation {
    createAudit(input: AuditInput!): QueuedAudit!
    deleteAudit(jobId: ID!): Boolean!
  }
`;
