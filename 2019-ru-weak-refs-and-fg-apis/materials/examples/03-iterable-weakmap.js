// source: https://github.com/tc39/proposal-weakrefs
'use strict';

class IterableWeakMap {
    _weakMap = new WeakMap();
    _refSet = new Set();
    _registry = new FinalizationRegistry(IterableWeakMap._cleanup);

    static _cleanup(iterator) {
        for (const { set, ref } of iterator) {
            set.delete(ref);
        }
    }

    constructor(iterable) {
        for (const [key, value] of iterable) {
            this.set(key, value);
        }
    }

    set(key, value) {
        const ref = new WeakRef(key);

        this._weakMap.set(key, { value, ref });
        this._refSet.add(ref);
        this._registry.register(key, {
            set: this._refSet,
            ref
        }, ref);
    }

    get(key) {
        const entry = this._weakMap.get(key);
        return entry && entry.value;
    }

    delete(key) {
        const entry = this._weakMap.get(key);
        if (!entry) {
            return false;
        }

        this._weakMap.delete(key);
        this._refSet.delete(entry.ref);
        this._registry.unregister(entry.ref);
        return true;
    }

    *[Symbol.iterator]() {
        for (const ref of this._refSet) {
            const key = ref.deref();
            if (!key) continue;
            const { value } = this._weakMap.get(key);
            yield [key, value];
        }
    }

    entries() {
        return this[Symbol.iterator]();
    }

    *keys() {
        for (const [key, value] of this) {
            yield key;
        }
    }

    *values() {
        for (const [key, value] of this) {
            yield value;
        }
    }
}


const key1 = { a: 1 };
const key2 = { b: 2 };
const keyValuePairs = [[key1, 'foo'], [key2, 'bar']];
const map = new IterableWeakMap(keyValuePairs);

for (const [key, value] of map) {
    console.log(`key: ${JSON.stringify(key)}, value: ${value}`);
}
// key: {"a":1}, value: foo
// key: {"b":2}, value: bar

for (const key of map.keys()) {
    console.log(`key: ${JSON.stringify(key)}`);
}
// key: {"a":1}
// key: {"b":2}

for (const value of map.values()) {
    console.log(`value: ${value}`);
}
// value: foo
// value: bar

map.get(key1);
// → foo

map.delete(key1);
// → true

for (const key of map.keys()) {
    console.log(`key: ${JSON.stringify(key)}`);
}
  // key: {"b":2}
