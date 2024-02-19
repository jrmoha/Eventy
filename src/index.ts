import express from "express";
import "dotenv/config";
import { ExpressConfig } from "../config/express.config";
import "./modules/inbox/inbox.model";
import "./modules/message/message.model";
const main = async () => {
  const app = express();
  const Express = new ExpressConfig(app);

  await Express.init();
};

main();
