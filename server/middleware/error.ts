import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err); // replaced by logger in prod
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
}