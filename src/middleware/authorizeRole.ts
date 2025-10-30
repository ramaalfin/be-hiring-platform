import { NextFunction, Request, Response } from "express";
import appAssert from "../utils/appAssert";
import { UNAUTHORIZED } from "../constants/http";

export const authorizeRole = (roles: string[]) => {
    return (req: Request & { userRole?: string }, res: Response, next: NextFunction) => {
        const userRole = req.userRole;
        appAssert(userRole && roles.includes(userRole), UNAUTHORIZED, "Not authorized");
        next();
    };
};
