import config from "config";
import jwt, { JwtPayload } from "jsonwebtoken";
export class Token {
  constructor() {}
  /**
   * This function signs a token
   * @param payload
   * @returns string - The signed token
   */

  public signAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.get<string>("jwt.private_key"), {
      expiresIn: config.get<string>("jwt.expiresIn"),
      algorithm: "RS256",
    });
  }

  /**
   * This function verifies a token
   * @param token
   * @returns JwtPayload
   */

  public verifyToken(token: string): JwtPayload {
    return jwt.verify(token, config.get<string>("jwt.public_key"), {
      algorithms: ["RS256"],
    }) as JwtPayload;
  }
  /**
   * @description This function signs a token for email verification
   * @param payload
   * @returns string - The signed token
   *
   */
  public signEmailToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.get<string>("jwt.private_key"), {
      expiresIn: config.get<string>("jwt.emailExpiresIn"),
      algorithm: "RS256",
    });
  }
  /**
   * @description This function signs a token for resending email verification
   * @param payload
   * @returns string - The signed token
   */
  public signResendEmailToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.get<string>("jwt.private_key"), {
      algorithm: "RS256",
    });
  }
  /**
   * @description This function signs a token for password reset
   * @param payload
   * @returns string - The signed token
   */
  public signPasswordResetToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.get<string>("jwt.private_key"), {
      expiresIn: `${config.get<string>("PASSWORD_RESET_CODE_EXPIRES_IN")}m`,
      algorithm: "RS256",
    });
  }
}
