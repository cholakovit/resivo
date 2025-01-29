import * as NodeCache from "node-cache";
import ApiError from "./ApiError";
import { HttpStatus } from "@nestjs/common";

const caches = new Map<string, NodeCache>();

/**
 * CacheResult is a method decorator that caches the result of a method
 * based on its arguments. It uses NodeCache for in-memory caching.
 *
 * Features:
 * - Caches results for a specified TTL (default: 60 seconds).
 * - Supports multiple caches identified by unique cacheId.
 * - Handles both synchronous and asynchronous methods.
 *
 * Limitations:
 * - Caching is in-memory and resets on application restart.
 */
export function CacheResult<T>(
  ttl: number = 60,
  cacheId: string = "default"
): MethodDecorator {
  if (!caches.has(cacheId)) caches.set(cacheId, new NodeCache({ stdTTL: ttl }));

  const cache = caches.get(cacheId)!;

  return function (
    _: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): void {
    const originalMethod = descriptor.value as (...args: unknown[]) => T;

    if (typeof originalMethod !== "function") {
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Descriptor value for method ${String(propertyKey)} is not a function.`
      );
    }

    descriptor.value = function (...args: unknown[]): T | Promise<T> {
      const cacheKey = `${String(propertyKey)}-${JSON.stringify(args)}`;
      const cachedResult = cache.get<T>(cacheKey);

      if (cachedResult !== undefined) return cachedResult;

      const result = originalMethod.apply(this, args);

      if (result instanceof Promise)
        return result.then((resolvedResult: T) => {
          cache.set(cacheKey, resolvedResult);
          return resolvedResult;
        });

      cache.set(cacheKey, result);
      return result;
    };
  };
}

/**
 * ClearCache is a method decorator that clears all cached results for a specific `cacheId`
 * after the decorated method is executed.
 *
 * Features:
 * - Supports both synchronous and asynchronous methods.
 * - Clears the cache only if it exists (`cacheId` is found in the cache map).
 * - Default cache ID is "default" if not explicitly specified.
 *
 * Example usage:
 * @ClearCache('exampleCache')
 * updateData(id: number, data: string): void;
 */
export function ClearCache(cacheId: string = "default"): MethodDecorator {
  return function <T>(
    _: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ): void {
    const originalMethod = descriptor.value as (...args: unknown[]) => T;

    if (typeof originalMethod !== "function")
      throw new ApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Descriptor value is not a function for method ${String(propertyKey)}`
      );

    descriptor.value = function (...args: unknown[]): T | Promise<T> {
      const result = originalMethod.apply(this, args);

      if (result instanceof Promise)
        return result.then((resolvedResult: T) => {
          if (caches.has(cacheId)) caches.get(cacheId)!.flushAll();

          return resolvedResult;
        });

      if (caches.has(cacheId)) caches.get(cacheId)!.flushAll();

      return result;
    } as T;
  };
}
