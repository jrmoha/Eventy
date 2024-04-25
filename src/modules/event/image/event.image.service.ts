import { Transaction } from "sequelize";
import Image from "../../image/image.model";
import Event from "../event.model";
import EventImage from "./event.image.model";

export class EventImageService {
  constructor() {}
  public async insertImages(
    images_array: Image[],
    event: Event,
    t?: Transaction,
  ): Promise<EventImage[]> {
    return EventImage.bulkCreate(
      images_array.map((image: Image) => ({
        event_id: event.id,
        public_id: image.public_id,
      })),
      { transaction: t },
    );
  }
}
