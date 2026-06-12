import { Request, Response, NextFunction } from "express"

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<void>

// Wraps async route handlers to catch errors automatically
export const asyncHandler = (fn: AsyncFn) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
