import { CacheKeysGenerator } from "../lib/cache_keys_generator";

export type ResourceType =
  keyof typeof CacheKeysGenerator.prototype.keysGenerator;
