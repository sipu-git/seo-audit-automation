export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  profilePicture: string | null;
  role: "CLIENT" | "ADMIN";
  createdAt: string;
  updatedAt: string;
};

export type AuthPayload = {
  user: AuthUser;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
};

export type ResetPasswordInput = {
  email: string;
  code: string;
  newPassword: string;
};
