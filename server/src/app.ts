import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { errorMiddleware, notFoundHandler } from "./middlewares/index";

// Import routes
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import customerRoutes from "./modules/customers/customer.routes";
import jobRoutes from "./modules/jobs/job.routes";
import jobStatusRoutes from "./modules/job-statuses/jobStatus.routes";
import taskRoutes from "./modules/tasks/task.routes";
import attachmentRoutes from "./modules/attachments/attachment.routes";
import signatureRoutes from "./modules/signatures/signature.routes";

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Parse JSON and cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/job-statuses", jobStatusRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/signatures", signatureRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorMiddleware);

export default app;
