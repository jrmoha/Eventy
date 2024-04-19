import { AnyZodObject, ZodError } from "zod";
import { NextFunction, Request, Response } from "express";
import { APIError } from "../../types/APIError.error";
import StatusCodes from "http-status-codes";
import { ParsedQs } from "qs";
import { ParamsDictionary } from "express-serve-static-core";

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = trimStringValues(req.body);
      req.query = trimStringValues(req.query) as ParsedQs;
      req.params = trimStringValues(req.params) as ParamsDictionary;

      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
        file: req.file,
        files: req.files,
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

/**
 * @description Trims all string values in an object
 * @param obj - The object to trim
 * @returns The object with all string values trimmed
 */

function trimStringValues(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const trimmedObj: Record<string, unknown> = {};
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      trimmedObj[key] = (obj[key] as string).trim();
    } else {
      trimmedObj[key] = obj[key];
    }
  }
  return trimmedObj;
}
