import { Types } from "mongoose";
import Person from "../modules/person/person.model";
declare module "jsonwebtoken" {
  export interface JwtPayload {
    id: number;
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    role: string;
    password_reset_code?: string;
    profile_image?: string;
  }
}
