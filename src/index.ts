import "dotenv/config";
import express from "express";
import { APP_ORIGIN, NODE_ENV, PORT } from "./constants/env";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import authRoutes from "./routes/auth.route";
import authenticate from "./middleware/authenticate";
import userRoutes from "./routes/user.route";
import sessionRoutes from "./routes/session.route";
import jobsRoutes from "./routes/jobs.route";
import applicationsRoutes from "./routes/applicant.route";
import employerRoutes from "./routes/employer.route";
import { requestLogger } from "./middleware/requestLogger";
import { logger } from "./utils/logger";

const app = express();

// Request logging
app.use(requestLogger);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://fe-hiring-platform.vercel.app",
  "https://hiring-platform.vercel.app",
  "https://verfatics.my.id",
  "https://server1.verfatics.my.id",
  "http://verfatics.my.id",
  "http://server1.verfatics.my.id",
];

// Add APP_ORIGIN if it exists
if (APP_ORIGIN) {
  allowedOrigins.push(APP_ORIGIN);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow any vercel.app domain
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Allow any railway.app domain
      if (origin.endsWith('.railway.app')) {
        return callback(null, true);
      }

      // Allow any verfatics.my.id subdomain
      if (origin.endsWith('.verfatics.my.id') || origin === 'https://verfatics.my.id') {
        return callback(null, true);
      }

      // Reject other origins
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/jobs", jobsRoutes);
app.use("/api/v1/applications", applicationsRoutes);
app.use("/api/v1/employer", employerRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

app.use(errorHandler);

app.listen(PORT, async () => {
  logger.info(`Server running at ${PORT || 5000} in ${NODE_ENV} mode`, "SERVER");
});
