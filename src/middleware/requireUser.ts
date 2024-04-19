import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";

export const requireUser = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = res.locals.user;

        if (!user) {
            return next(new ErrorHandler(400, "Session has expired or user doesn't exist"));
        }

        next();
    } catch (error) {
        next(error);
    }
}