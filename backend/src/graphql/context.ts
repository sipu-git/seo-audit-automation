import type { Request, Response } from "express";
import { prisma } from "../db/client.js";
import { authService } from "../modules/auth/services/auth.service.js";
import {
  clearAuthCookies as clearCookies,
  setAccessCookie,
  setAuthCookies as setCookies,
  verifyAccessToken,
  verifyRefreshToken,
} from "../modules/auth/services/auth-token.service.js";

export type AuthenticatedUser = NonNullable<Awaited<ReturnType<typeof authService.findPublicAuthById>>>;

export interface GraphQLContext {
  prisma: typeof prisma;
  user: AuthenticatedUser | null;
  clientIp: string;
  setAuthCookies: (userId: string) => void;
  clearAuthCookies: () => void;
}

function readCookie(req: Request, name: string) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(";")) {
    const separator = cookie.indexOf("=");
    if (separator < 0 || cookie.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(cookie.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

export async function createContext({ req, res }: { req: Request; res: Response }): Promise<GraphQLContext> {
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  const accessToken = readCookie(req, "accessToken");
  const refreshToken = readCookie(req, "refreshToken");
  let userId = accessToken ? verifyAccessToken(accessToken) : null;
  const refreshingAccessToken = !userId && Boolean(refreshToken);

  if (!userId && refreshToken) userId = verifyRefreshToken(refreshToken);

  const user = userId ? await authService.findPublicAuthById(userId) : null;
  if (user && refreshingAccessToken) setAccessCookie(res, user.id);
  if (!user && (accessToken || refreshToken)) clearCookies(res);

  return {
    prisma,
    user,
    clientIp,
    setAuthCookies: (authenticatedUserId) => setCookies(res, authenticatedUserId),
    clearAuthCookies: () => clearCookies(res),
  };
}
