import { SignOptions, VerifyOptions } from "jsonwebtoken";
// import { SessionDocument } from "../model/session.model";
// import { UserDocument } from "../model/user.model";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../constants/env";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client";

export type RefreshTokenPayload = {
  sessionId: string;
};

export type AccessTokenPayload = {
  userId: string;
  sessionId: string;
  role: any;
};

type SignOptionsAndSecret = SignOptions & { secret: string };

const defaults: SignOptions = {
  audience: ["user"],
};

const access_tokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "15m",
  secret: JWT_SECRET,
};

export const refresh_tokenSignOptions: SignOptionsAndSecret = {
  expiresIn: "1w",
  secret: JWT_REFRESH_SECRET,
};

export const signToken = (
  payload: AccessTokenPayload | RefreshTokenPayload,
  options?: SignOptionsAndSecret
) => {
  const { secret, ...signOpts } = options || access_tokenSignOptions;
  return jwt.sign(payload, secret, { ...defaults, ...signOpts });
};

export const verifyToken = <TPayload extends object = AccessTokenPayload>(
  token: string,
  options?: VerifyOptions & { secret: string }
) => {
  const { secret = JWT_SECRET, ...verifyOpts } = options || {};
  try {
    const payload = jwt.verify(token, secret, {
      ...defaults,
      ...verifyOpts,
    }) as TPayload;

    return { payload };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const generateUserTokens = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const session = await prisma.session.create({
    data: { userId, userAgent: "magic_link" },
  });

  const sessionInfo = { sessionId: session.id };

  const refresh_token = signToken(sessionInfo, refresh_tokenSignOptions);
  const access_token = signToken({
    ...sessionInfo,
    userId,
    role: user?.role,
  });

  return { access_token, refresh_token };
};
