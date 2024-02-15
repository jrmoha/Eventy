import config from "config";
import bcrypt from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
  const salt_rounds = config.get<number>("bcrypt.SALT_ROUNDS");
  return bcrypt.hash(password, +salt_rounds);
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
