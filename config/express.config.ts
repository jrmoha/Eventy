import express, { Express, NextFunction, Request, Response } from "express";
import { Server } from "http";
import cors from "cors";
import config from "config";
import database from "../src/database";
import {
  error_handler,
  routeError,
  unhandledRejection,
  uncaughtException,
  sigint,
} from "../src/interfaces/middleware/error.handler";
import routes from "../src/modules";
import {
  req_logger,
  err_logger,
} from "../src/interfaces/middleware/logger.middleware";
import logger from "../src/utils/logger";
import { SocketService } from "../src/services/socket";
import { RedisService } from "../src/cache";
export class ExpressConfig {
  private app: Express;
  private port: number;

  constructor(express: Express) {
    this.app = express;
    this.port = config.get<number>("port");
  }

  public async init(): Promise<void> {
    try {
      const server = new Server(this.app);
      const io = new SocketService(server);
      await io.init();
      global.io = io.getIO();
      // this.app.use(express.json());
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.originalUrl == "/api/v1/orders/webhook") {
          //  express.raw({ type: "application/json" })(req, res, next);
          next();
        } else {
          express.json()(req, res, next);
        }
      });

      this.app.use(cors());
      this.app.use(req_logger);
      this.app.use(routes);

      this.app.use(routeError);
      this.app.use(err_logger);
      this.app.use(sigint);
      this.app.use(error_handler);
      process.on("unhandledRejection", unhandledRejection);
      process.on("uncaughtException", uncaughtException);

      const redis = new RedisService();
      await redis.connect();

      await database.init();
      server.listen(this.port, () => {
        logger.info(`Server is running on port ${this.port}`);
      });
    } catch (error) {
      logger.error(`Error in express config: ${error}`);
      process.exit(1);
    }
  }
}
