import { NextFunction, Request, Response } from "express";
import logger from "../../log/logger";

export const req_logger = (req: Request, res: Response, next: NextFunction) => {
  //TODO:${JSON.stringify({
  // body: req.body,
  // query: req.query,
  // params: req.params,
  // header: req.headers,
  // })}
  logger.info(
    `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`,
  );

  next();
};

export const err_logger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(`${err.name}: ${err.message}   
   ${JSON.stringify({
     stack: err?.stack,
     body: req.body,
     query: req.query,
     params: req.params,
     header: req.headers,
   })}`);
  next(err);
};
