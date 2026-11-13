import { prisma } from "../../../db/client";

export function createAuth(input: {email: string;fullName: string;
  password: string;phone: string | null}) {
  return prisma.auth.create({
    data: input,
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      profilePicture: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export function toAuthPayload(user: {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
}

export function isUniqueEmailError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}