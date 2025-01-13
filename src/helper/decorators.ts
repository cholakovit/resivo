import * as NodeCache from 'node-cache';

const caches = new Map<string, NodeCache>();

export function CacheResult(ttl: number = 60, cacheId: string = 'default') {
    if(!caches.has(cacheId)) {
        caches.set(cacheId, new NodeCache({ stdTTL: ttl }));
    }
    const cache = caches.get(cacheId)!;

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const cacheKey = `${propertyKey}-${JSON.stringify(args)}`
            const cachedResult = cache.get(cacheKey);

            if(cachedResult !== undefined) {
                return cachedResult;
            }

            const result = await originalMethod.apply(this, args);
            cache.set(cacheKey, result);
            return result;
        }
    }
}

export function ClearCache(cacheId: string = 'default') {
    if(caches.has(cacheId)) {
        caches.get(cacheId)!.flushAll();
    }
}