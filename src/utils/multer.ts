import multer from "multer";
import path from "path";
import fs from "fs";
import { AllowedMedia, allowed_types } from "../types/media.type";
import { Request } from "express";
import { APIError } from "../types/APIError.error";
import StatusCodes from "http-status-codes";

const storage = (folder = "") => {
  const path_ = path.resolve("uploads", folder);
  if (!fs.existsSync(path_)) {
    fs.mkdirSync(path_, { recursive: true });
  }
  return multer.diskStorage({
    destination(req, file, callback) {
      callback(null, path_);
    },
    filename(req, file, callback) {
      callback(
        null,
        `${new Date().getTime()}${path.extname(file.originalname)}`,
      );
    },
  });
};

const filter = (field: AllowedMedia) => {
  return (_req: Request, file: Express.Multer.File, callback: Function) => {
    const mimetype = allowed_types[field].test(file.mimetype.split("/")[1]);
    const extname = allowed_types[field].test(
      path.extname(file.originalname).toLowerCase().split(".")[1],
    );

    if (mimetype && extname) {
      return callback(null, true);
    }

    const err = new APIError(
      `Error: File upload only supports the following filetypes - ${allowed_types[field]}`,
      StatusCodes.BAD_REQUEST,
    );
    return callback(err, false);
  };
};

const upload = function (field: AllowedMedia, folder = "") {
  return multer({
    storage: storage(folder),
    fileFilter: filter(field),
  });
};

export default upload;
