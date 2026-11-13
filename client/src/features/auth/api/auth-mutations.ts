import { gql } from "@apollo/client";

const AUTH_USER_FIELDS = gql`
  fragment AuthUserFields on AuthUser {
    id
    email
    fullName
    phone
    profilePicture
    role
    createdAt
    updatedAt
  }
`;

export const SIGN_IN_MUTATION = gql`
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) {
      user {
        ...AuthUserFields
      }
    }
  }
  ${AUTH_USER_FIELDS}
`;

export const SIGN_UP_MUTATION = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      user {
        ...AuthUserFields
      }
    }
  }
  ${AUTH_USER_FIELDS}
`;

export const SIGN_OUT_MUTATION = gql`
  mutation SignOut {
    signOut
  }
`;

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) {
      message
    }
  }
`;

export const RESET_PASSWORD_WITH_OTP_MUTATION = gql`
  mutation ResetPasswordWithOtp(
    $email: String!
    $code: String!
    $newPassword: String!
  ) {
    resetPasswordWithOtp(
      email: $email
      code: $code
      newPassword: $newPassword
    )
  }
`;

export type SignInMutationData = {
  signIn: import("./auth-types").AuthPayload;
};

export type SignUpMutationData = {
  signUp: import("./auth-types").AuthPayload;
};

export type RequestPasswordResetMutationData = {
  requestPasswordReset: { message: string };
};

export type ResetPasswordWithOtpMutationData = {
  resetPasswordWithOtp: boolean;
};
