import { SettingsService } from "./settings/settings.service";
import { JwtPayload } from "jsonwebtoken";
import config from "config";
import { NextFunction, Request, Response } from "express";
import StatusCodes from "http-status-codes";
import { async_ } from "../../interfaces/middleware/async.middleware";
import cloudinary from "../../utils/cloudinary";
import Image from "../image/image.model";
import fs from "fs";
import UserImage from "./image/user.image.model";
import Person from "../person/person.model";
import { APIError } from "../../error/api-error";
import {
  ChangeEmailInput,
  ChangePasswordInput,
  UpdateUserInput,
} from "./user.validator";
import { sequelize } from "../../database";
import { APIFeatures } from "../../utils/api.features";
import Event from "../event/event.model";
import Post from "../post/post.model";
import bcrypt from "bcryptjs";
import { Token } from "../../utils/token";
import { CacheKeysGenerator } from "../../utils/cache_keys_generator";
import { RedisService } from "../../cache";
import { UserService } from "./user.service";

export const update = async_(
  async (
    req: Request<{}, {}, UpdateUserInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const { first_name, last_name, username, phone_number, gender, birthdate } =
      req.body;

    const person = (await Person.findByPk(user_id, {
      attributes: { exclude: ["password"] },
    })) as Person;

    first_name && (person.first_name = first_name);
    last_name && (person.last_name = last_name);
    gender && (person.gender = gender);
    birthdate && (person.birthdate = birthdate);

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

    await person.save().then(() => {
      Post.findAll({
        where: { organizer_id: user_id },
        attributes: ["id"],
      }).then((posts) => {
        posts.map((post) => {
          Event.update({ id: post.id }, { where: { id: post.id } });
        });
      });
    });

    const payload: JwtPayload = {
      id: req.user?.id as number,
      username: person.username,
      email: person.email,
      first_name: person.first_name,
      last_name: person.last_name,
      role: req.user?.role || "u",
      profile_image: req.user?.profile_image,
    };

    const { signAccessToken } = new Token();
    const token = signAccessToken(payload);

    //Delete all user cache from redis
    const redisClient = new RedisService();
    const pattern: string = `User:${req.user?.id}*`;
    await redisClient.delByPattern(pattern);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: person,
      token,
    });
  },
);
export const change_email = async_(
  async (
    req: Request<{}, {}, ChangeEmailInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const { email } = req.body;

    const person = (await Person.findByPk(user_id, {
      attributes: { exclude: ["password"] },
    })) as Person;

    if (email && email !== person.email) {
      const email_exists = await Person.findOne({
        where: { email },
      });

      if (email_exists)
        throw new APIError("Email already exists", StatusCodes.CONFLICT);

      person.email = email;
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
export const change_password = async_(
  async (
    req: Request<{}, {}, ChangePasswordInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const user_id = req.user?.id;
    const { old_password, new_password } = req.body;

    const user = await Person.findByPk(user_id);
    if (!user) throw new APIError("User not found", StatusCodes.NOT_FOUND);

    const isMatch = await bcrypt.compare(old_password, user.password as string);

    if (!isMatch)
      throw new APIError("Invalid password", StatusCodes.UNAUTHORIZED);

    user.password = await bcrypt.hash(
      new_password,
      +config.get<string>("bcrypt.SALT_ROUNDS"),
    );

    await user.save();

    const payload: JwtPayload = {
      id: req.user?.id as number,
      username: req.user?.username,
      first_name: req.user?.first_name,
      last_name: req.user?.last_name,
      email: req.user?.email,
      role: req.user?.role || "u",
      profile_image: req.user?.profile_image,
    };

    const { signAccessToken } = new Token();
    const token = signAccessToken(payload);

    return res.status(StatusCodes.OK).json({ success: true, token });
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

    await UserImage.update(
      { is_profile: false },
      { where: { user_id, is_profile: true } },
    );

    await UserImage.create({
      public_id,
      user_id,
      is_profile: true,
    });

    const payload: JwtPayload = {
      id: req.user?.id as number,
      username: req.user?.username,
      first_name: req.user?.first_name,
      last_name: req.user?.last_name,
      role: req.user?.role || "u",
      email: req.user?.email,
      profile_image: secure_url,
    };

    const { signAccessToken } = new Token();
    const token = signAccessToken(payload);

    //Delete all user cache from redis
    const redisClient = new RedisService();
    await redisClient.delByPattern(`User:${req.user?.id}*`);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      data: { public_id: image.public_id, url: image.url },
      token,
    });
  },
);
export const deleteImage = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user?.id;

    const userImage = await UserImage.findOne({
      where: { user_id, is_profile: true },
    });

    if (!userImage)
      throw new APIError("Profile image not found", StatusCodes.NOT_FOUND);

    if (userImage.public_id == config.get<string>("images.default_user_image"))
      throw new APIError(
        "You can't delete the default profile image",
        StatusCodes.BAD_REQUEST,
      );

    await cloudinary.uploader.destroy(userImage.public_id);
    await userImage.destroy();

    const newProfileImage = await UserImage.findOne({
      where: { user_id },
      include: [
        {
          model: Image,
          attributes: [],
        },
      ],
      attributes: [
        "public_id",
        "user_id",
        [sequelize.col("Image.secure_url"), "secure_url"],
      ],
      order: [["createdAt", "DESC"]],
    });

    await newProfileImage!.update({ is_profile: true });

    const payload: JwtPayload = {
      id: req.user?.id as number,
      username: req.user?.username,
      first_name: req.user?.first_name,
      last_name: req.user?.last_name,
      role: req.user?.role || "u",
      email: req.user?.email,
      profile_image: newProfileImage?.secure_url,
    };

    const { signAccessToken } = new Token();
    const token = signAccessToken(payload);

    const redisClient = new RedisService();
    await redisClient.delByPattern(`User:${req.user?.id}*`);

    return res.status(StatusCodes.OK).json({
      success: true,
      token,
    });
  },
);
export const profile = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const UserServiceInstance = new UserService();
    const user = await UserServiceInstance.profile(+id, req.user?.id);

    if (!user) throw new APIError("user not found", StatusCodes.NOT_FOUND);

    const SettingsServiceInstance = new SettingsService();
    await SettingsServiceInstance.setSettings(user, req.user?.id);

    //********Cache *********
    const redisClient = new RedisService();
    const key: string = new CacheKeysGenerator().keysGenerator["user"](req);
    await redisClient.set(key, user);

    return res.status(StatusCodes.OK).json({ success: true, data: user });
  },
);
export const likes = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const apifeatures = new APIFeatures(req.query).paginate();
    const UserServiceInstance = new UserService();
    const likes = await UserServiceInstance.likes(
      +id,
      req.user?.id,
      apifeatures,
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      data: likes,
    });
  },
);
export const interest = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const apifeatures = new APIFeatures(req.query).paginate();
    const UserServiceInstance = new UserService();
    const interests = await UserServiceInstance.interests(
      +id,
      req.user?.id,
      apifeatures,
    );
    return res.status(StatusCodes.OK).json({
      success: true,
      data: interests,
    });
  },
);

export const basic_info = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const user_id = req.user?.id;
    const user = await Person.findByPk(user_id, {
      attributes: [
        "id",
        "first_name",
        "last_name",
        "username",
        "email",
        "phone_number",
        "gender",
        "birthdate",
      ],
    });

    const profile_image = await UserImage.findOne({
      where: { user_id, is_profile: true },
      include: [
        {
          model: Image,
          attributes: [],
        },
      ],
      attributes: ["public_id", [sequelize.col("Image.secure_url"), "url"]],
    });

    user?.setDataValue("profile_image", profile_image);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: user,
    });
  },
);
