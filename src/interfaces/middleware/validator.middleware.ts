import { AnyZodObject, ZodError } from "zod";
import { NextFunction, Request, Response } from "express";
import { APIError } from "../../types/APIError.error";
import StatusCodes from "http-status-codes";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const e = error.errors.map((err) => err.message).join(", ");
        return next(new APIError(e, StatusCodes.BAD_REQUEST));
      }

      return next(error);
    }
  };
