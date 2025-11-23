"server-only";

// Simple cache configuration without db dependency
// This breaks the circular dependency: cache.server.ts -> db -> repositories -> cache.server.ts

export function getCacheConfig() {
  const cacheType = process.env.CACHE_TYPE;

  // Explicit override
  if (cacheType === "null" || cacheType === "false") {
    return null;
  }

  if (cacheType === "redis" && process.env.REDIS_URL) {
    return "redis";
  }

  if (cacheType === "memory") {
    return "memory";
  }

  // Auto-detect based on environment
  if (process.env.REDIS_URL) {
    return "redis";
  }

  // Default to memory cache in development, null in production
  return process.env.NODE_ENV === "development" ? "memory" : null;
}

export function shouldUseCache(): boolean {
  return getCacheConfig() !== null;
}
