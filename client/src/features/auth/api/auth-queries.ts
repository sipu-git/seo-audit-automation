import { gql } from "@apollo/client";

export const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    me {
      id
      email
      fullName
      phone
      profilePicture
      role
      createdAt
      updatedAt
    }
  }
`;

export type CurrentUserQueryData = {
  me: import("./auth-types").AuthUser;
};
