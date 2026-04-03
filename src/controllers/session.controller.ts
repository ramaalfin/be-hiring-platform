import { z } from "zod";
import { NOT_FOUND, OK, UNAUTHORIZED, BAD_REQUEST } from "../constants/http";
import catchErrors from "../utils/catchErros";
import appAssert from "../utils/appAssert";
import { clearAuthCookies } from "../utils/cookies";
import prisma from "../prisma/client";

export const getAllSessionController = catchErrors(async (req, res) => {
  const userId = req.userId;
  const sessionId = req.sessionId;

  appAssert(userId, UNAUTHORIZED, "User not authenticated");
  appAssert(sessionId, UNAUTHORIZED, "Session not found");

  const sessions = await prisma.session.findMany({
    where: {
      userId: userId.toString(),
    },
  });

  const modifiedSessions = sessions.map((session) => {
    return {
      ...session,
      isCurrent: session.id.toString() === sessionId.toString(),
    };
  });

  return res.status(OK).json({
    sessions: modifiedSessions,
  });
});

export const getSessionController = catchErrors(async (req, res) => {
  const sessionId = req?.sessionId;

  appAssert(sessionId, NOT_FOUND, "Session not found");

  const session = await prisma.session.findUnique({
    where: { id: sessionId.toString() },
  });

  if (!session) {
    clearAuthCookies(res);
    return res.status(UNAUTHORIZED).json({
      message: "Session not found",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId.toString() },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true
    },
  });

  return res.status(OK).json({ user });
});

export const deleteSessionController = catchErrors(async (req, res) => {
  const sessionId = z.string().parse(req.params.id);
  const userId = req.userId;

  appAssert(userId, UNAUTHORIZED, "User not authenticated");

  const deleted = await prisma.session.delete({
    where: {
      id: sessionId,
      userId: userId.toString(),
    },
  });

  appAssert(deleted, NOT_FOUND, "Session not found");
  return res.status(OK).json({ message: "Session deleted" });
});
