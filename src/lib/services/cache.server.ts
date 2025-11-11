import { cachified as originalCachified, CachifiedOptions, verboseReporter } from "@epic-web/cachified";
import { getCacheConfig } from "./cacheConfig.server";

const CACHE_LOGGING_ENABLED = true;

// Lazy load Redis to avoid bundling in client-side code
let redisClient: any = null;
let cacheAdapter: any = null;
let isConnecting = false;
let connectionPromise: Promise<void> | null = null;

async function getRedisClient() {
  if (redisClient) return redisClient;
  if (isConnecting && connectionPromise) {
    await connectionPromise;
    return redisClient;
  }

  isConnecting = true;
  connectionPromise = (async () => {
    try {
      if (!process.env.REDIS_URL) {
        console.warn("REDIS_URL env var is not set, caching will be disabled");
        return;
      }

      const { createClient } = await import("redis");
      redisClient = createClient({
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              console.error("Redis connection failed after 3 retries, disabling cache");
              return new Error("Redis unavailable");
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      const cacheType = getCacheConfig();
      if (cacheType === "redis") {
        redisClient.on("error", function (err: Error) {
          console.error("Redis error:", err);
          // Don't crash the app on Redis errors
        });
        
        try {
          await redisClient.connect();
          await redisClient.set("cat", "stack");
          console.log("Redis connected successfully");
        } catch (err) {
          console.error("Failed to connect to Redis:", err);
          redisClient = null;
          return;
        }
      }
    } catch (err) {
      console.error("Error initializing Redis client:", err);
      redisClient = null;
    } finally {
      isConnecting = false;
    }
  })();

  await connectionPromise;
  return redisClient;
}

async function getCache() {
  if (cacheAdapter) return cacheAdapter;
  
  const cacheType = getCacheConfig();
  if (cacheType !== "redis") {
    return null;
  }

  const redis = await getRedisClient();
  const { redisCacheAdapter } = await import("cachified-redis-adapter");
  cacheAdapter = redisCacheAdapter(redis);
  return cacheAdapter;
}

export const cache = {
  get: async (key: string) => {
    const cacheInstance = await getCache();
    if (!cacheInstance) return undefined;
    return cacheInstance.get(key);
  },
  set: async (key: string, value: any) => {
    const cacheInstance = await getCache();
    if (!cacheInstance) return;
    return cacheInstance.set(key, value);
  },
  delete: async (key: string) => {
    const cacheInstance = await getCache();
    if (!cacheInstance) return;
    return cacheInstance.delete(key);
  },
};

export async function cachified<Value>(
  options: Omit<CachifiedOptions<Value>, "cache"> & {
    disabled?: boolean;
  }
): Promise<Value> {
  const cacheType = getCacheConfig();
  if (!cacheType || options.disabled) {
    // @ts-ignore
    return options.getFreshValue(options);
  }
  
  const cacheInstance = await getCache();
  
  // If cache instance is null, fallback to getting fresh value
  if (!cacheInstance) {
    // @ts-ignore
    return options.getFreshValue(options);
  }
  
  return originalCachified(
    {
      ...options,
      cache: cacheInstance,
    },
    CACHE_LOGGING_ENABLED ? verboseReporter() : undefined
  );
}

export async function clearCacheKey(key: string): Promise<void> {
  const cacheType = getCacheConfig();
  if (!cacheType) {
    return;
  }
  await cache.delete(key);
}

export type CachedValue = {
  key: string;
  value: any;
  sizeMb: number;
  createdAt: Date;
  createdTime: number;
};

export async function getCachedValues() {
  const cacheType = getCacheConfig();
  if (!cacheType) {
    return [];
  }
  const redis = await getRedisClient();
  const allKeys = await redis.keys("*");
  const cachedValues: CachedValue[] = [];
  for (const key of allKeys) {
    if (cachedValues.find((x) => x.key === key)) {
      continue;
    }
    const value = await redis.get(key);
    if (!value) {
      continue;
    }
    const sizeBytes = new TextEncoder().encode(JSON.stringify(value)).length;
    const sizeMb = sizeBytes / 1024 / 1024;
    // const createdTime = value.metadata.createdTime;
    // const createdAt = new Date(createdTime);
    // const cachedValue = { key, value: value.value, sizeMb, createdAt, createdTime };
    cachedValues.push({
      key,
      value,
      sizeMb,
      createdAt: new Date(),
      createdTime: Date.now(),
    });
  }
  return cachedValues;
}

export async function clearAllCache() {
  const cacheType = getCacheConfig();
  if (!cacheType) {
    return;
  }
  const redis = await getRedisClient();
  await redis.flushAll();
}
