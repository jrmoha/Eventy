import { Op } from "sequelize";
import Person from "./person.model";

export class PersonService {
  constructor() {}
  public async getUnconfirmedUsers(): Promise<Person[]> {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    console.log(oneWeekAgo);

    return Person.findAll({
      where: {
        confirmed: false,
        [Op.or]: [
          { createdAt: { [Op.lt]: oneWeekAgo } },
          { updatedAt: { [Op.lt]: oneWeekAgo } },
        ],
      },
      attributes: ["id"],
    });
  }
  public async deletePerson(id: number): Promise<number> {
    return Person.destroy({
      where: { id },
    });
  }
}
