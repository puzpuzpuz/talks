// source: https://github.com/tc39/proposal-weakrefs
'use strict';

function makeWeakCached(fn) {
    const cache = new Map();
    const cleanup = new FinalizationRegistry(iterator => {
        for (const key of iterator) {
            const ref = cache.get(key);
            if (ref && !ref.deref()) cache.delete(key);
        }
    });

    return key => {
        const ref = cache.get(key);
        if (ref) {
            const cached = ref.deref();
            if (cached !== undefined) return cached;
        }

        const fresh = fn(key);
        cache.set(key, new WeakRef(fresh));
        cleanup.register(fresh, key, key);
        return fresh;
    };
}

let getImageCached = makeWeakCached(getImage);
