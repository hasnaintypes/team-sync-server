import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "cookie-session";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/error-handler.middleware";
import { asyncHandler } from "./middlewares/async-handler.middleware";
import { HTTP_STATUS } from "./config/http.config";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  })
);

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

// Swagger API docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Expose raw Swagger JSON for Postman import
app.get("/api/docs-json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

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

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
