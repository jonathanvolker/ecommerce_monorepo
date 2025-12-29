export interface IForgotPasswordInput {
  email: string;
}

export interface IResetPasswordInput {
  token: string;
  password: string;
}

export interface IChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
