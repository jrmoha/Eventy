import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";

export const overview = async_(
  async (req: Request, res: Response, next: NextFunction) => {},
);
