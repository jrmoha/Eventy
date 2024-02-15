import express, { Express } from "express";
import cors from "cors";
import config from "config";
import database from "../src/database";
import {
  error_handler,
  routeError,
} from "../src/interfaces/middleware/error.handler";
import authRoutes from "../src/modules/authentication/authentication.routes";

export class ExpressConfig {
  private app: Express;
  private port = config.get<number>("port");

  constructor(express: Express) {
    this.app = express;
  }

  public async init(): Promise<void> {
    try {
      this.app.use(express.json());
      this.app.use(cors());

      this.app.use("/api/v1/authentication", authRoutes);
      this.app.use(routeError);
      this.app.use(error_handler);

      await database.init();
      this.app.listen(this.port, () => {
        console.log(`Server is running on port ${this.port}`);
      });
    } catch (error) {
      console.error(error);
    }
  }
}
