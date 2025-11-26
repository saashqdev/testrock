import { cachified as originalCachified, CachifiedOptions, verboseReporter } from "@epic-web/cachified";
import { getCacheConfig } from "./cacheConfig.server";
import { LRUCache } from "lru-cache";

const CACHE_LOGGING_ENABLED = true;

// Lazy load Redis to avoid bundling in client-side code
let redisClient: any = null;
let cacheAdapter: any = null;
let isConnecting = false;
let connectionPromise: Promise<void> | null = null;

// Memory cache using LRU
let memoryCache: LRUCache<string, any> | null = null;

function getMemoryCache() {
  if (!memoryCache) {
    memoryCache = new LRUCache({
      max: 500, // Maximum number of items
      ttl: 1000 * 60 * 60, // 1 hour default TTL
      maxSize: 50 * 1024 * 1024, // 50MB max cache size
      sizeCalculation: (value) => {
        return JSON.stringify(value).length;
      },
    });
  }
  return memoryCache;
}

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
  const cacheType = getCacheConfig();
  
  if (cacheType === "memory") {
    const lru = getMemoryCache();
    // Return a cachified-compatible adapter
    return {
      get: async (key: string) => lru.get(key),
      set: async (key: string, value: any) => lru.set(key, value),
      delete: async (key: string) => lru.delete(key),
    };
  }
  
  if (cacheType !== "redis") {
    return null;
  }

  const redis = await getRedisClient();
  if (!redis) {
    return null;
  }

  // Check if redis client is still connected
  if (!redis.isOpen) {
    console.warn("Redis client is closed, resetting connection");
    redisClient = null;
    cacheAdapter = null;
    return null;
  }

  // Only create cache adapter if we don't have one or if it's stale
  if (!cacheAdapter) {
    const { redisCacheAdapter } = await import("cachified-redis-adapter");
    cacheAdapter = redisCacheAdapter(redis);
  }

  return cacheAdapter;
}

export const cache = {
  get: async (key: string) => {
    try {
      const cacheInstance = await getCache();
      if (!cacheInstance) return undefined;
      return await cacheInstance.get(key);
    } catch (err) {
      console.error("Cache get error:", err);
      return undefined;
    }
  },
  set: async (key: string, value: any) => {
    try {
      const cacheInstance = await getCache();
      if (!cacheInstance) return;
      return await cacheInstance.set(key, value);
    } catch (err) {
      console.error("Cache set error:", err);
      return;
    }
  },
  delete: async (key: string) => {
    try {
      const cacheInstance = await getCache();
      if (!cacheInstance) return;
      return await cacheInstance.delete(key);
    } catch (err) {
      console.error("Cache delete error:", err);
      return;
    }
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

  try {
    const cacheInstance = await getCache();

    // If cache instance is null, fallback to getting fresh value
    if (!cacheInstance) {
      // @ts-ignore
      return options.getFreshValue(options);
    }

    return await originalCachified(
      {
        ...options,
        cache: cacheInstance,
      },
      CACHE_LOGGING_ENABLED ? verboseReporter() : undefined
    );
  } catch (err: any) {
    if (err.message?.includes("closed")) {
      console.warn("Redis client closed, resetting connection and fetching fresh value");
      redisClient = null;
      cacheAdapter = null;
    } else {
      console.error("Cache error, falling back to fresh value:", err);
    }
    // @ts-ignore
    return options.getFreshValue(options);
  }
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
  
  try {
    const cachedValues: CachedValue[] = [];
    
    if (cacheType === "memory") {
      const lru = getMemoryCache();
      const allKeys = Array.from(lru.keys());
      
      for (const key of allKeys) {
        const value = lru.get(key);
        if (!value) {
          continue;
        }
        const sizeBytes = new TextEncoder().encode(JSON.stringify(value)).length;
        const sizeMb = sizeBytes / 1024 / 1024;
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
    
    // Redis cache
    const redis = await getRedisClient();
    if (!redis || !redis.isOpen) {
      return [];
    }
    const allKeys = await redis.keys("*");
    
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
      cachedValues.push({
        key,
        value,
        sizeMb,
        createdAt: new Date(),
        createdTime: Date.now(),
      });
    }
    return cachedValues;
  } catch (err) {
    console.error("Error getting cached values:", err);
    redisClient = null;
    cacheAdapter = null;
    return [];
  }
}

export async function clearAllCache() {
  const cacheType = getCacheConfig();
  if (!cacheType) {
    return;
  }
  
  try {
    if (cacheType === "memory") {
      const lru = getMemoryCache();
      lru.clear();
      return;
    }
    
    // Redis cache
    const redis = await getRedisClient();
    if (!redis || !redis.isOpen) {
      return;
    }
    await redis.flushAll();
  } catch (err) {
    console.error("Error clearing cache:", err);
    redisClient = null;
    cacheAdapter = null;
  }
}
