import "dotenv/config";
import express from "express";
// import connectToDatabase from "./config/db";
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

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://fe-hiring-platform.vercel.app",
      "https://hiring-platform.vercel.app",
    ],
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

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server running at ${PORT} in ${NODE_ENV} mode`);
});
