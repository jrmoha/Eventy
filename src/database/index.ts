// import { Pool } from "pg";
// import config from "config";

// export class Database {
//   private pool: Pool;

//   constructor(pool: Pool) {
//     this.pool = pool;
//   }

//   public async init(): Promise<void> {
//     try {
//       await this.pool.connect();
//       console.log("Connected to database");
//     } catch (error) {
//       console.log("Error connecting to database");
//       console.error(error);
//     }
//   }
//   public pool_(): Pool {
//     return this.pool;
//   }
// }

// const pool = new Pool({
//   host: config.get<string>("database.host"),
//   user: config.get<string>("database.user"),
//   password: config.get<string>("database.password"),
//   port: config.get<number>("database.port"),
//   database: config.get<string>("database.database"),
// });

// const database = new Database(pool);
// export const pool_ = database.pool_();
// export default database;

import { Sequelize } from "sequelize";
import config from "config";
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
        benchmark: true,
      });
      console.log("Connected to database");
    } catch (error) {
      console.log("Error connecting to database");
      console.error(error);
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
