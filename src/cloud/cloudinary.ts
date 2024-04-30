import { v2 as cloudinary } from "cloudinary";
import config from "config";

cloudinary.config({
  cloud_name: config.get("cloudinary.CLOUD_NAME"),
  api_key: config.get("cloudinary.API_KEY"),
  api_secret: config.get("cloudinary.API_SECRET"),
});

export default cloudinary;
