const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    throw Error(`Missing String environment variable for ${key}`);
  }

  return value;
};

export const NODE_ENV = getEnv("NODE_ENV", "development");
export const PORT = getEnv("PORT");
// export const MONGO_URI = getEnv("MONGO_URI");
export const APP_ORIGIN = getEnv("APP_ORIGIN");
export const JWT_SECRET = getEnv("JWT_SECRET");
export const JWT_REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET");
// export const EMAIL_SENDER = getEnv("EMAIL_SENDER");
// export const RESEND_API_KEY = getEnv("RESEND_API_KEY");
export const EMAIL_SERVICE = getEnv("EMAIL_SERVICE", "gmail");
export const GMAIL_USER = getEnv("GMAIL_USER");
export const GMAIL_PASS = getEnv("GMAIL_PASS");
