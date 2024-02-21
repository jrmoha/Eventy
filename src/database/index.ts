import { Sequelize } from "sequelize";
import config from "config";
import logger from "../utils/logger";
export class Database {
  private readonly sequelize: Sequelize;

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
  }

  public async init(): Promise<void> {
    try {
      await this.sequelize.authenticate({ logging: false });
      await this.sequelize.sync({
        alter: true,
        force: false,
        logging: false,
      });
      logger.info("Connected to database");
    } catch (error) {
      logger.error(`Error connecting to database: ${error}`);
      throw error;
    }
  }
  public getSequelize(): Sequelize {
    return this.sequelize;
  }
}

const sequelize_ = new Sequelize(
  config.get<string>("database.database"),
  config.get<string>("database.user"),
  config.get<string>("database.password"),
  {
    host: config.get<string>("database.host"),
    dialect: "postgres",
    port: config.get<number>("database.port"),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);
const database = new Database(sequelize_);
export const sequelize = database.getSequelize();
export default database;
