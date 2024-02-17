import { NextFunction, Request, Response } from "express";
import config from "config";
import StatusCodes from "http-status-codes";
import { APIError } from "../../types/APIError.error";
import fs from "fs";

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

export const error_handler = function (
  err: Error | APIError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.file) fs.unlinkSync(req.file.path);

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
