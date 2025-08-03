import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../utils/app-error";

/**
 * Middleware to ensure user is authenticated.
 * Checks if req.user exists and has a valid user ID.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @throws {UnauthorizedException} When user is not authenticated
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user._id) {
    throw new UnauthorizedException("Unauthorized. Please log in.");
  }
  next();
};

export default requireAuth;
