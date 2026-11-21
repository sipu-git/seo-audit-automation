import type { NextFunction, Request, Response } from "express";
import { createContext } from "../../../graphql/context.js";
import { authService } from "../services/authentication/auth.service.js";
import { isProfilePictureContentType } from "../utils/profile-utils/media-files.util.js";

export async function uploadProfilePictureController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const context = await createContext({ req: request, res: response });
    if (!context.user) {
      response.status(401).json({ error: "Sign in to upload a profile picture." });
      return;
    }

    const contentType = request.get("content-type")?.split(";")[0].trim().toLowerCase() ?? "";
    if (!isProfilePictureContentType(contentType)) {
      response.status(400).json({ error: "Choose a JPEG, PNG, or WebP image." });
      return;
    }

    if (!Buffer.isBuffer(request.body) || request.body.byteLength === 0) {
      response.status(400).json({ error: "Choose a non-empty profile picture." });
      return;
    }

    const reference = await authService.uploadMyProfilePicture(
      context.user.id,
      contentType,
      request.body,
    );
    response.setHeader("Cache-Control", "private, no-store");
    response.status(201).json({ reference });
  } catch (error) {
    next(error);
  }
}
