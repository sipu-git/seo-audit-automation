import type { Prisma } from "../generated/prisma/client";

export function toJson(value: unknown): Prisma.InputJsonValue {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new TypeError("Database JSON values must be serializable.");
  }
  return JSON.parse(serialized) as Prisma.InputJsonValue;
}
