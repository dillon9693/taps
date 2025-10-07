import { gql } from "@apollo/client";

export type RegisterMutationResult = {
  registerUser: {
    success: boolean;
    errors: string[];
  };
};

export const REGISTER_USER = gql`
  mutation RegisterUser(
    $email: String!
    $password: String!
    $firstName: String!
    $lastName: String!
  ) {
    registerUser(
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
    ) {
      success
      errors
    }
  }
`;

export type LoginUserResult = {
  loginUser: {
    success: boolean;
    errors: string[];
  };
};

export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      success
      errors
    }
  }
`;

export const LOGOUT_USER = gql`
  mutation LogoutUser {
    logoutUser {
      success
    }
  }
`;

export type RequestPasswordResetResult = {
  requestPasswordReset: {
    success: boolean;
    message: string;
  };
};

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) {
      success
      message
    }
  }
`;

export type ResetPasswordResult = {
  resetPassword: {
    success: boolean;
    errors: string[];
  };
};

export const RESET_PASSWORD = gql`
  mutation ResetPassword(
    $token: String!
    $newPassword: String!
    $uid: String!
  ) {
    resetPassword(token: $token, newPassword: $newPassword, uid: $uid) {
      success
      errors
    }
  }
`;

export type TagVoteResult = {
  tagVote: {
    success: boolean;
    newUpvoteCount: number;
    newDownvoteCount: number;
    errors: string[];
  };
};

export const TAG_VOTE = gql`
  mutation TagVote($tagId: ID!, $beerId: ID!, $upvote: Boolean!) {
    tagVote(tagId: $tagId, beerId: $beerId, upvote: $upvote) {
      success
      newUpvoteCount
      newDownvoteCount
      errors
    }
  }
`;
