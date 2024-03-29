import config from "config";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
/**
 * @description This function hashes a password
 * @param password
 * @returns string
 */
export const hash = async (password: string): Promise<string> => {
  const salt_rounds = config.get<number>("bcrypt.SALT_ROUNDS");
  return bcrypt.hash(password, +salt_rounds);
};
/**
 * @description This function compares a password with a hash
 * @param password
 * @param hash
 * @returns boolean
 */
export const compare = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * This is a utility function that converts a number to a cool string
 * @param num - The number to convert
 * @returns A string representation of the number
 *
 */

export const numberToString = (num: number): string => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + "K";
  if (num < 1000000000) return (num / 1000000).toFixed(1) + "M";
  return "0";
};

/**
 * This function signs a token
 * @param payload
 * @returns string - The signed token
 */

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.get<string>("jwt.private_key"), {
    expiresIn: config.get<string>("jwt.expiresIn"),
    algorithm: "RS256",
  });
};

/**
 * This function verifies a token
 * @param token
 * @returns JwtPayload
 */

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.get<string>("jwt.public_key"), {
    algorithms: ["RS256"],
  }) as JwtPayload;
};
