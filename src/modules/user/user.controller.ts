import { NextFunction, Request, Response } from "express";
import StatusCodes from "http-status-codes";
import { async_ } from "../../interfaces/middleware/async.middleware";
import cloudinary from "../../utils/cloudinary";
import Image from "../image/image.model";
import fs from "fs";
import UserImage from "../image/user.image.model";

export const uploadImage = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user?.id;
    const file = req.file as Express.Multer.File;

    const { public_id, url, secure_url, format } =
      await cloudinary.uploader.upload(file.path, {
        folder: `eventy/persons/users/${user_id}`,
        resource_type: "image",
      });

    fs.unlinkSync(file.path);

    const image = await Image.create({
      public_id,
      url,
      secure_url,
      size: file.size,
      format,
    });

    await UserImage.create({
      public_id,
      user_id,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      data: { public_id: image.public_id, url: image.url },
    });
  },
);
