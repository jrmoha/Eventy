import { NextFunction, Request, Response } from "express";
import config from "config";
import StatusCodes from "http-status-codes";
import { APIError } from "../../error/api-error";
import fs from "fs";
import logger from "../../utils/logger";

export const routeError = function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const err = new APIError(
    `This route ${req.originalUrl} doesn't exist`,
    StatusCodes.NOT_FOUND,
  );
  next(err);
};

export const error_handler = async function (
  err: Error | APIError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req?.file && req.files?.length == 1) fs.unlinkSync(req.file?.path);

  if (req.transaction) await req.transaction.rollback();

  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      success: false,
      name: err.name,
      error: err.message,
      status: err.statusCode,
      ...(config.get<string>("NODE_ENV") === "development" && {
        stack: err.stack,
      }),
    });
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    name: err.name,
    error: err.message,
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    ...(config.get<string>("NODE_ENV") === "development" && {
      stack: err.stack,
    }),
  });
};

export const unhandledRejection = (
  reason: unknown,
  promise: Promise<unknown>,
) => {
  logger.error(`Unhandled Rejection at: ${promise} reason: ${reason}`);
  process.exit(1);
};
export const uncaughtException = (error: Error) => {
  logger.error(`Uncaught Exception ${error}`);
  process.exit(1);
};

export const sigint = () => {
  logger.info("SIGINT received...");
  process.exit(0);
};
