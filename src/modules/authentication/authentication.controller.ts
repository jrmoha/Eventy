import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import Person from "../person/person.model";
import User from "../user/user.model";
import { Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import { APIError } from "../../types/APIError.error";
import { comparePassword, hashPassword } from "../../utils/functions";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "config";
import {
  LoginInput,
  SignupInput,
  EmailInput,
  PasswordResetInput,
} from "./authentication.schema";
import Organizer from "../organizer/organizer.model";
import {
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "../../interfaces/handlers/email/email.handler";
import { nanoid } from "nanoid";

export const signup = async_(
  async (
    req: Request<{}, {}, SignupInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const {
      username,
      email,
      phone_number,
      first_name,
      last_name,
      password,
      birthdate,
      gender,
    } = req.body;

    const person_exists = await Person.findOne({
      where: {
        [Op.or]: [{ username }, { email }, { phone_number }],
      },
    });

    if (person_exists) {
      if (person_exists.username == username) {
        throw new APIError("Username already exists", StatusCodes.CONFLICT);
      }
      if (person_exists.email == email) {
        throw new APIError("Email already exists", StatusCodes.CONFLICT);
      }
      if (person_exists.phone_number == phone_number) {
        throw new APIError("Phone number already exists", StatusCodes.CONFLICT);
      }
    }

    const password_hash = await hashPassword(password);

    const person = await Person.create({
      username,
      email,
      phone_number,
      first_name,
      last_name,
      password: password_hash,
      birthdate,
      gender,
    });

    await User.create({ id: person.id });
    if (config.get<string>("NODE_ENV") !== "test")
      await sendVerificationEmail(person);
    else {
      person.confirmed = true;
      await person.save();
    }

    return res
      .status(StatusCodes.CREATED)
      .json({ success: true, message: "Please confirm you email" });
  },
);
export const login = async_(
  async (
    req: Request<{}, {}, LoginInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const { query, password } = req.body;

    const person = await Person.findOne({
      where: {
        [Op.or]: [
          { username: query },
          { email: query },
          { phone_number: query },
        ],
      },
    });

    if (!person)
      throw new APIError("This user does not exist", StatusCodes.NOT_FOUND);

    const is_password_valid = await comparePassword(password, person.password);

    if (!is_password_valid)
      throw new APIError("Invalid password", StatusCodes.UNAUTHORIZED);

    if (!person.confirmed)
      throw new APIError(
        "Please confirm your email before logging in",
        StatusCodes.UNAUTHORIZED,
      );

    const organizer = await Organizer.findByPk(person.id);

    const payload: JwtPayload = {
      id: person.id,
      username: person.username,
      first_name: person.first_name,
      last_name: person.last_name,
      role: organizer ? "o" : "u",
    };

    const token = jwt.sign(payload, config.get<string>("jwt.secret"), {
      expiresIn: config.get<string>("jwt.expiresIn"),
    });

    return res.status(StatusCodes.OK).json({ success: true, token });
  },
);

export const emailVerification = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { t } = req.query as EmailInput;
    const decoded = jwt.verify(
      t,
      config.get<string>("jwt.secret"),
    ) as JwtPayload;

    if (!decoded?.id)
      throw new APIError("Invalid token", StatusCodes.BAD_REQUEST);

    const person = await Person.findByPk(decoded.id);

    if (!person)
      throw new APIError("User does not exist", StatusCodes.NOT_FOUND);

    person.confirmed = true;
    await person.save();

    return res.status(StatusCodes.ACCEPTED).json({ success: true });
  },
);
export const resendEmailVerification = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const t = req.query.t as string;

    const decoded = jwt.verify(
      t,
      config.get<string>("jwt.secret"),
    ) as JwtPayload;

    if (!decoded?.id)
      throw new APIError("Invalid token", StatusCodes.BAD_REQUEST);

    const person = await Person.findByPk(decoded.id);

    if (!person)
      throw new APIError("User does not exist", StatusCodes.NOT_FOUND);

    if (person.confirmed)
      throw new APIError("User is already confirmed", StatusCodes.BAD_REQUEST);

    await sendVerificationEmail(person);

    return res.status(StatusCodes.ACCEPTED).json({ success: true });
  },
);

export const forgotPassword = async_(
  async (
    req: Request<{}, {}, PasswordResetInput>,
    res: Response,
    next: NextFunction,
  ) => {
    const { email } = req.body;

    const person = await Person.findOne({ where: { email } });
    if (!person)
      throw new APIError("User does not exist", StatusCodes.NOT_FOUND);

    if (!person.confirmed)
      throw new APIError(
        "Please confirm your email before resetting your password",
        StatusCodes.UNAUTHORIZED,
      );

    if (
      person.password_reset_code_time &&
      person.password_reset_code_time > new Date()
    )
      throw new APIError(
        "You have already requested a password reset code",
        StatusCodes.BAD_REQUEST,
      );

    const password_reset_code = nanoid(
      config.get<number>("PASSWORD_RESET_CODE_LENGTH"),
    );

    person.password_reset_code = password_reset_code;

    person.password_reset_code_time = new Date(
      Date.now() + config.get<number>("passwordResetCodeExpiresIn") * 60 * 1000,
    );
    await person.save();
    console.log(person.password_reset_code_time);

    const sent = await sendResetPasswordEmail(person);
    return sent
      ? res.status(StatusCodes.ACCEPTED).json({ success: true })
      : next(new APIError("Error Occurred", StatusCodes.INTERNAL_SERVER_ERROR));
  },
);
