import * as NodeCache from 'node-cache';

const caches = new Map<string, NodeCache>();

export function CacheResult(
    ttl: number = 60,
    cacheId: string = "default"
  ): MethodDecorator {
    if (!caches.has(cacheId)) {
      caches.set(cacheId, new NodeCache({ stdTTL: ttl }));
    }
    const cache = caches.get(cacheId)!;
  
    return function (
      _: Object,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ): void {
      const originalMethod = descriptor.value;
  
      if (typeof originalMethod !== "function") {
        throw new Error(`Descriptor value for method ${String(propertyKey)} is not a function.`);
      }
  
      descriptor.value = function (...args: unknown[]): unknown {
        const cacheKey = `${String(propertyKey)}-${JSON.stringify(args)}`;
        const cachedResult = cache.get<unknown>(cacheKey);
  
        if (cachedResult !== undefined) {
          return cachedResult;
        }
  
        const result = originalMethod.apply(this, args);
  
        if (result instanceof Promise) {
          return result.then((resolvedResult) => {
            cache.set(cacheKey, resolvedResult);
            return resolvedResult;
          });
        }
  
        cache.set(cacheKey, result);
        return result;
      };
    };
  }


export function ClearCache(cacheId: string = 'default'): MethodDecorator {
    return function <T>(
      _: Object,
      propertyKey: string | symbol,
      descriptor: TypedPropertyDescriptor<T>
    ): void {
      const originalMethod = descriptor.value;
  
      if (typeof originalMethod !== 'function') {
        throw new Error(`Descriptor value is not a function for method ${String(propertyKey)}`);
      }
  
      descriptor.value = function (...args: unknown[]) {
        const result = originalMethod.apply(this, args);
  
        if (result instanceof Promise) {
          return result.then((resolvedResult) => {
            if (caches.has(cacheId)) {
              caches.get(cacheId)!.flushAll();
            }
            return resolvedResult;
          });
        }
  
        if (caches.has(cacheId)) {
          caches.get(cacheId)!.flushAll();
        }
  
        return result;
      } as T;
  
    };
  }
  
  
  
