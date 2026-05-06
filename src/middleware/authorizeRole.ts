import { NextFunction, Request, Response } from "express";
import appAssert from "../utils/appAssert";
import { FORBIDDEN } from "../constants/http";

export const authorizeRole = (roles: string[]) => {
    return (req: Request & { userRole?: string }, res: Response, next: NextFunction) => {
        const userRole = req.userRole;
        appAssert(userRole && roles.includes(userRole), FORBIDDEN, "Insufficient permissions");
        next();
    };
};
