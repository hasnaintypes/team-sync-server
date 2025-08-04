import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/error-handler.middleware";
import { asyncHandler } from "./middlewares/async-handler.middleware";
import { HTTP_STATUS } from "./config/http.config";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";

import "./config/passport.config";
import passport from "passport";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import requireAuth from "./middlewares/auth.middleware.ts ";
import workspaceRoutes from "./routes/workspace.route";
import memberRoutes from "./routes/member.route";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: config.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());

app.use(passport.session());

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

// Swagger API docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get(
  `/`,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(HTTP_STATUS.OK).json({
      message: "Welcome to the Team Sync Server",
      version: "1.0.0",
      basePath: BASE_PATH,
    });
  })
);

// Import routes
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, requireAuth, userRoutes);
app.use(`${BASE_PATH}/workspace`, requireAuth, workspaceRoutes);
app.use(`${BASE_PATH}/member`, requireAuth, memberRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(
    `[Server] Listening on port ${config.PORT} in ${config.NODE_ENV}`
  );
  await connectDatabase();
});
