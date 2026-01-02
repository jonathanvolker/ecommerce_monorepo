/**
 * Simple in-memory cache service for API responses
 * Reduces redundant requests for static/semi-static data
 */

interface CacheItem<T> {
  data: T;
  expiry: number;
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();

  /**
   * Get cached data
   * @param key Cache key
   * @returns Cached data or null if expired/not found
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  /**
   * Set data in cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttl = 300000): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  /**
   * Invalidate cache entry
   * @param key Cache key (supports wildcards with *)
   */
  invalidate(key: string): void {
    if (key.includes('*')) {
      // Wildcard invalidation
      const pattern = key.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      
      for (const cacheKey of this.cache.keys()) {
        if (regex.test(cacheKey)) {
          this.cache.delete(cacheKey);
        }
      }
    } else {
      this.cache.delete(key);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const cacheService = new CacheService();
