export const auditPreviewTypeDefs = `#graphql
  type AuditPreview {
    status: String!
    dataSources: JSON
    business: JSON
    signals: JSON
    analysis: JSON
    note: String
  }

  extend type Mutation {
    auditPreview(input: AuditInput!): AuditPreview!
  }
`;
