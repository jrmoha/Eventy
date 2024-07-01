import { JwtPayload } from "jsonwebtoken";
import { Transaction } from "sequelize";

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload;
      transaction?: Transaction;
    }
  }
}

export {};
