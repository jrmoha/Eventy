import { Types } from "mongoose";
declare module "jsonwebtoken" {
  export interface JwtPayload {
    id: number;
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    role: string;
  }
}
