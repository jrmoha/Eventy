import fs from "fs";
import { Transaction } from "sequelize";
import Event from "../event/event.model";
import cloudinary from "../../utils/cloudinary";
import Image from "./image.model";

export class ImageService {
  constructor() {}
  public async uploadEventImages(
    images: Express.Multer.File[],
    event: Event,
    t?: Transaction,
  ) {
    return Promise.all(
      images.map(async (img: Express.Multer.File) => {
        const { public_id, secure_url, url } = await cloudinary.uploader.upload(
          img.path,
          {
            folder: `eventy/posts/events/${event.id}`,
            resource_type: "image",
          },
        );
        const image = await Image.create(
          {
            public_id,
            secure_url,
            url,
            size: img.size,
            format: img.mimetype,
          },
          { transaction: t },
        );
        fs.unlinkSync(img.path);
        return image;
      }),
    );
  }
}
