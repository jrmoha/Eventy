import config from "config";
import bcrypt from "bcryptjs";

class Password {
  constructor() {}
  /**
   * @description This function hashes a password
   * @param password
   * @returns string
   */
  public async hash(password: string): Promise<string> {
    const salt_rounds = config.get<number>("bcrypt.SALT_ROUNDS");
    return bcrypt.hash(password, +salt_rounds);
  }
  /**
   * @description This function compares a password with a hash
   * @param password
   * @param hash
   * @returns boolean
   */
  public async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

export default Password;
