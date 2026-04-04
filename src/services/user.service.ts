import prisma from "../prisma/client";
import { hashValue } from "../utils/bcrypt";
import bcrypt from "bcryptjs";
import appAssert from "../utils/appAssert";
import { BAD_REQUEST, NOT_FOUND } from "../constants/http";

export const getUserService = async (userId: string) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isDefaultPassword: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};

export const updateUserProfileService = async (
    userId: string,
    data: {
        fullName?: string;
        currentPassword?: string;
        newPassword?: string;
    }
) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    appAssert(user, NOT_FOUND, "User not found");

    const updateData: any = {};

    // Update fullName if provided
    if (data.fullName) {
        updateData.fullName = data.fullName;
    }

    // Update password if provided
    if (data.newPassword) {
        // Verify current password
        if (data.currentPassword) {
            const isPasswordValid = await bcrypt.compare(
                data.currentPassword,
                user.password
            );
            appAssert(isPasswordValid, BAD_REQUEST, "Current password is incorrect");
        }

        updateData.password = await hashValue(data.newPassword);
        updateData.isDefaultPassword = false;
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isDefaultPassword: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return updatedUser;
};
