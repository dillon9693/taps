import { gql } from "@apollo/client";

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

export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(username: $username, password: $password) {
      success
      errors
    }
  }
`;

export const LOGOUT_USER = gql`
  mutation LogoutUser {
    logoutUser {
      success
      errors
    }
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) {
      success
      errors
    }
  }
`;

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
