import { CacheKeysGenerator } from "../utils/cache_keys_generator";

export type ResourceType =
  keyof typeof CacheKeysGenerator.prototype.keysGenerator;
