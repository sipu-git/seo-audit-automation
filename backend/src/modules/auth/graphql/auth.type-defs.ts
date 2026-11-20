export const authTypeDefs = `#graphql
  input SignUpInput {
    fullName: String!
    email: String!
    password: String!
    phone: String
  }

  input SignInInput {
    email: String!
    password: String!
  }

  input UpdateMyProfileInput {
    fullName: String!
    email: String!
    phone: String
  }

  type AuthUser {
    id: ID!
    email: String!
    fullName: String!
    phone: String
    profilePicture: String
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    user: AuthUser!
  }

  type PasswordResetRequestResult {
    message: String!
  }

  extend type Query {
    me: AuthUser!
    viewAllUsers: [AuthUser!]!
  }

  extend type Mutation {
    signUp(input: SignUpInput!): AuthPayload!
    signIn(input: SignInInput!): AuthPayload!
    signOut: Boolean!
    updateMyProfile(input: UpdateMyProfileInput!): AuthUser!
    deleteMyAccount: Boolean!
    requestPasswordReset(email: String!): PasswordResetRequestResult!
    resetPasswordWithOtp(email: String!, code: String!, newPassword: String!): Boolean!
  }
`;
