import { CacheKeysGenerator } from "../utils/cacheKeysGenerator";

export type resourceType =
  keyof typeof CacheKeysGenerator.prototype.keysGenerator;
