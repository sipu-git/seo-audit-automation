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

export const UPDATE_MY_PROFILE_MUTATION = gql`
  mutation UpdateMyProfile($input: UpdateMyProfileInput!) {
    updateMyProfile(input: $input) {
      ...AuthUserFields
    }
  }
  ${AUTH_USER_FIELDS}
`;

export const COMPLETE_MY_PROFILE_PICTURE_UPLOAD_MUTATION = gql`
  mutation CompleteMyProfilePictureUpload($reference: String!) {
    completeMyProfilePictureUpload(reference: $reference) {
      ...AuthUserFields
    }
  }
  ${AUTH_USER_FIELDS}
`;

export const DELETE_MY_ACCOUNT_MUTATION = gql`
  mutation DeleteMyAccount {
    deleteMyAccount
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

export type UpdateMyProfileMutationData = {
  updateMyProfile: import("./auth-types").AuthUser;
};

export type UpdateMyProfileMutationVariables = {
  input: {
    fullName: string;
    email: string;
    phone: string | null;
  };
};

export type CompleteMyProfilePictureUploadMutationData = {
  completeMyProfilePictureUpload: import("./auth-types").AuthUser;
};

export type CompleteMyProfilePictureUploadMutationVariables = {
  reference: string;
};

export type DeleteMyAccountMutationData = {
  deleteMyAccount: boolean;
};

export type RequestPasswordResetMutationData = {
  requestPasswordReset: { message: string };
};

export type ResetPasswordWithOtpMutationData = {
  resetPasswordWithOtp: boolean;
};
