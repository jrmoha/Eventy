import express from "express";
import "dotenv/config";
import "./modules/comment/comment.model";
import { ExpressConfig } from "../config/express.config";

const main = async () => {
  const app = express();
  const Express = new ExpressConfig(app);

  await Express.init();
};

main();
