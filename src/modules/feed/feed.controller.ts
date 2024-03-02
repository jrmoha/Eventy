import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";

export const get_home = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    
  },
);

export const get_feed = async_(
  async (req: Request, res: Response, next: NextFunction) => {},
);
