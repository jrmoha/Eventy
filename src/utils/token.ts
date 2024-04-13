import config from "config";
import jwt, { JwtPayload } from "jsonwebtoken";

export class Token {
  /**
   * This function signs a token
   * @param payload
   * @returns string - The signed token
   */

  public signToken(payload: JwtPayload): string {
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
}
