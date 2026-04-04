import { RequestHandler } from "express";
import appAssert from "../utils/appAssert";
import AppErrorCode from "../constants/appErrorCode";
import { FORBIDDEN } from "../constants/http";
import prisma from "../prisma/client";

const requireVerified: RequestHandler = async (req, res, next) => {
    const userId = req.userId;

    appAssert(
        userId,
        FORBIDDEN,
        "User not authenticated",
        AppErrorCode.InvalidAccessToken
    );

    // Cek status verified user
    const user = await prisma.user.findUnique({
        where: { id: userId.toString() },
        select: { verified: true },
    });

    appAssert(
        user?.verified,
        FORBIDDEN,
        "Email not verified. Please verify your email first.",
        AppErrorCode.EmailNotVerified
    );

    next();
};

export default requireVerified;
