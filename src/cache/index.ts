import { Redis } from "ioredis";
import logger from "../utils/logger";
import config from "config";
export class RedisService {
  private readonly client: Redis;

  constructor() {
    if (config.get<string>("NODE_ENV") === "development") {
      this.client = new Redis({
        host: config.get<string>("redis.host"),
        port: config.get<number>("redis.port"),
      });
    } else {
      this.client = new Redis(config.get<string>("redis.url"));
    }
  }

  public async connect() {
    return new Promise<void>((resolve, reject) => {
      this.client.on("connect", () => {
        logger.info("Redis connected");
        resolve();
      });
      this.client.on("error", (err) => {
        logger.error("Redis connection error", err);
        reject(err);
      });
    });
  }
  public async set(key: string, value: Object | Object[]): Promise<string> {
    return this.client.set(
      key,
      JSON.stringify(value),
      "EX",
      config.get<number>("redis.ex"),
    );
  }
  public async del(key: string): Promise<number> {
    return this.client.del(key);
  }
  private async getKeysByPattern(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }
   public async delByPattern(pattern: string): Promise<number> {
    const keys = await this.getKeysByPattern(pattern);
    for(const key of keys) {
      await this.del(key);
    }
    return keys.length;
   }
  get Client() {
    return this.client;
  }
}
