import { NextFunction, Request, Response } from "express";
import StatusCodes from "http-status-codes";
import { async_ } from "../../interfaces/middleware/async.middleware";
import cloudinary from "../../utils/cloudinary";
import Image from "../image/image.model";
import fs from "fs";
import UserImage from "../image/user.image.model";
import Person from "../person/person.model";
import { APIError } from "../../types/APIError.error";
import { UpdateUserInput } from "./user.validator";

export const update = async_(
  async (
    req: Request<{}, {}, UpdateUserInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const {
      first_name,
      last_name,
      username,
      email,
      phone_number,
      gender,
      birthdate,
    } = req.body;

    const person = (await Person.findByPk(user_id, {
      attributes: { exclude: ["password"] },
    })) as Person;
    first_name && (person.first_name = first_name);
    last_name && (person.last_name = last_name);
    gender && (person.gender = gender);
    birthdate && (person.birthdate = new Date(birthdate));

    if (username && username !== person.username) {
      {
        const username_exists = await Person.findOne({
          where: { username },
        });

        if (username_exists) {
          throw new APIError("Username already exists", StatusCodes.CONFLICT);
        }

        person.username = username;
      }
    }
    if (email && email !== person.email) {
      const email_exists = await Person.findOne({
        where: { email },
      });

      if (email_exists) {
        throw new APIError("Email already exists", StatusCodes.CONFLICT);
      }

      person.email = email;
    }
    if (phone_number && phone_number !== person.phone_number) {
      const phone_number_exists = await Person.findOne({
        where: { phone_number },
      });

      if (phone_number_exists) {
        throw new APIError("Phone number already exists", StatusCodes.CONFLICT);
      }

      person.phone_number = phone_number;
    }

    if (!person.changed())
      throw new APIError("No changes detected", StatusCodes.BAD_REQUEST);

    await person.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      data: person,
    });
  },
);

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
