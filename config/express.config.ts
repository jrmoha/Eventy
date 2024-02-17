import express, { Express } from "express";
import cors from "cors";
import config from "config";
import database from "../src/database";
import {
  error_handler,
  routeError,
} from "../src/interfaces/middleware/error.handler";
import authRoutes from "../src/modules/authentication/authentication.routes";
import userRoutes from "../src/modules/user/user.routes";
import {
  req_logger,
  err_logger,
} from "../src/interfaces/middleware/logger.middleware";
import logger from "../src/utils/logger";
export class ExpressConfig {
  private app: Express;
  private port: number;

  constructor(express: Express) {
    this.app = express;
    this.port = config.get<number>("port");
  }

  public async init(): Promise<void> {
    try {
      this.app.use(express.json());
      this.app.use(cors());
      this.app.use(req_logger);
      this.app.use("/api/v1/authentication", authRoutes);
      this.app.use("/api/v1/users", userRoutes);

      this.app.use(routeError);
      this.app.use(err_logger);
      this.app.use(error_handler);

      await database.init();
      this.app.listen(this.port, () => {
        logger.info(`Server is running on port ${this.port}`);
      });
    } catch (error) {
      console.error(error);
    }
  }
}
