import { NOT_FOUND, OK } from "../constants/http";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErros";
import { getUserService } from "../services/user.service";

export const getUserController = catchErrors(async (req, res) => {
  // const user = await UserModel.findById(req.userId);
  // const user = await prisma.user.findUnique({
  //   where: { id: req.userId.toString() },
  //   select: {
  //     id: true,
  //     fullName: true,
  //     email: true,
  //     createdAt: true,
  //     updatedAt: true,
  //   },
  // });

  try {
    const userId = String(req.userId.toString());
    const user = await getUserService(userId);

    if (!user) {
      appAssert(user, NOT_FOUND, "User not found");
      return;
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});
