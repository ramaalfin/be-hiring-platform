import { NOT_FOUND, OK, UNAUTHORIZED } from "../constants/http";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErros";
import { getUserService, updateUserProfileService } from "../services/user.service";

export const getUserController = catchErrors(async (req, res) => {
  const userId = req.userId;

  appAssert(userId, UNAUTHORIZED, "User not authenticated");

  try {
    const user = await getUserService(userId.toString());

    appAssert(user, NOT_FOUND, "User not found");

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

export const updateUserProfileController = catchErrors(async (req, res) => {
  const userId = req.userId;

  appAssert(userId, UNAUTHORIZED, "User not authenticated");

  const { fullName, currentPassword, newPassword } = req.body;

  const updatedUser = await updateUserProfileService(userId.toString(), {
    fullName,
    currentPassword,
    newPassword,
  });

  return res.status(OK).json({
    message: "Profile updated successfully",
    user: updatedUser,
  });
});
