// source: https://github.com/tc39/proposal-weakrefs
'use strict';

function makeWeakCached(f) {
    const cache = new Map();
    const cleanup = new FinalizationRegistry(key => {
        // See note below on concurrency considerations.
        const ref = cache.get(key);
        if (ref && !ref.deref()) cache.delete(key);
    });

    return key => {
        const ref = cache.get(key);
        if (ref) {
            const cached = ref.deref();
            // See note below on concurrency considerations.
            if (cached !== undefined) return cached;
        }

        const fresh = f(key);
        cache.set(key, new WeakRef(fresh));
        cleanup.register(fresh, key);
        return fresh;
    };
}

const getImageCached = makeWeakCached(getImage);
