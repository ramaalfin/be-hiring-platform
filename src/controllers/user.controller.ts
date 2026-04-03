import { NOT_FOUND, OK, UNAUTHORIZED } from "../constants/http";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErros";
import { getUserService } from "../services/user.service";

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
