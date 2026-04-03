declare global {
  namespace Express {
    interface Request {
      userId?: string;
      sessionId?: string;
      userRole?: string;
    }
  }
}

export { };

export { };
