---
marp: true
theme: default
---

<style>
section.lead h1 {
  padding-top: 12px;
}

section.lead h1, section.lead h2 {
  padding-left: 30px;
}

section {
  font-size: 30px;
}

h1 {
  font-size: 42px;
  color: #5c5c5c;
}

pre {
  line-height: 1.4;
}

img[alt~="center"] {
  display: block;
  margin: 0 auto;
}

table td {
  width: 150px;
}
</style>

<!-- _class: lead -->

# ES6 коллекции на примере V8:<br/>у ней внутре неонка

## Андрей Печкуров

![bg](./images/hazelcast-bg.jpg)

---

<!-- paginate: true -->

# О докладчике

* Пишу на Java (очень долго), Node.js (долго)
* Node.js core collaborator
* Интересы: веб, архитектура, распределенные системы, производительность
* Можно найти тут:

  - https://twitter.com/AndreyPechkurov
  - https://github.com/puzpuzpuz
  - https://medium.com/@apechkurov

---

# Disclamer

* Изложение основано на V8 8.4, Node.js [commit 238104c](https://github.com/nodejs/node/commit/238104c531219db05e3421521c305404ce0c0cce)
* Полагаться можно (и нужно) только на спецификацию ECMAScript
* Автор не работает в команде V8

---

<!-- TODO update -->

# План на сегодня

* Немного истории
* Map/Set
  - Алгоритм
  - Особенности реализации
  - Сложность
  - Память
* WeakMap/WeakSet
  - TODO

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

# Немного истории

---

[ECMAScript 2015](https://262.ecma-international.org/6.0/) (ES6) привнес в JS стандартные коллекции:
  - Map
  - Set
  - WeakMap
  - WeakSet

---

```js
const map = new Map();
map.set('foo', { bar: 'baz' });
for (let [key, value] of map) {
  console.log(`${key}:`, value);
}

const set = new Set();
set.add('foo');
set.add('bar');
set.forEach((item) => {
  console.log(item);
});
```

---

Спецификация не настаивает ни на чем конкретном:

> Map object must be implemented using **either hash tables or other mechanisms** that, on average, provide access times that are sublinear on the number of elements in the collection. The data structures used in this Map objects specification is only intended to describe the required observable semantics of Map objects. It is not intended to be a viable implementation model.

---

![w:1000 center](./images/maps-in-java.png)

---

# Хеш-функция

![w:640 center](./images/hash-functions.png)

---

# Пустая хеш-таблица

![w:1000 center](./images/hash-table-1.png)

---

# Вставка

![w:1000 center](./images/hash-table-2.png)

---

# Результат вставки

![w:1000 center](./images/hash-table-3.png)

---

# Обработка коллизий

![w:1000 center](./images/hash-table-4.png)

---

# Что внутри у Map/Set?

В силу спецификации в Map/Set не может быть "классической" хеш-таблицы

---

> When the forEach method is called with one or two arguments, the following steps are taken:
> ...
> 7. Repeat for each Record {[[key]], [[value]]} e that is an element of entries, in original key **insertion order**

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

# Map/Set: алгоритм

---

V8 реализует [deterministic hash tables](https://wiki.mozilla.org/User:Jorend/Deterministic_hash_tables) (Tyler Close)

---

```ts
interface CloseTable {
    hashTable: number[];
    dataTable: Entry[];
    nextSlot: number;
    size: number;
}

interface Entry {
    key: any;
    value: any;
    chain: number;
}
```

---

![w:900 center](./images/close-table-1.png)

---

![w:900 center](./images/close-table-2.png)

---

![w:900 center](./images/close-table-3.png)

---

![w:900 center](./images/close-table-4.png)

---

![w:900 center](./images/close-table-5.png)

---

![w:900 center](./images/close-table-6.png)

---

![w:900 center](./images/close-table-7.png)

---

![w:900 center](./images/close-table-8.png)

---

![w:900 center](./images/close-table-9.png)

---

![w:900 center](./images/close-table-10.png)

---

![w:900 center](./images/close-table-11.png)

---

![w:900 center](./images/close-table-12.png)

---

![w:900 center](./images/close-table-13.png)

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

# Map/Set: особенности реализации

---

Основа реализации Map/Set - классы `OrderedHashTable` и `OrderedHashMap`:
* [ordered-hash-table.h](https://github.com/nodejs/node/blob/238104c531219db05e3421521c305404ce0c0cce/deps/v8/src/objects/ordered-hash-table.h)
* [ordered-hash-table.cc](https://github.com/nodejs/node/blob/238104c531219db05e3421521c305404ce0c0cce/deps/v8/src/objects/ordered-hash-table.cc)
* [builtins-collections-gen.cc](https://github.com/nodejs/node/blob/238104c531219db05e3421521c305404ce0c0cce/deps/v8/src/builtins/builtins-collections-gen.cc)

---

# Емкость

* Емкость это всегда степерь двойки
* Load factor равен 2 => емкость === 2 * кол_во_бакетов

---

# Границы

* Начальная емкость: `new Map()` содержит 2 бакета (емкость равна 4)
* Максимальная емкость: на 64-битной системе емкость Map ограничена 2²⁷ (~16.7 млн. пар)

---

# Перехеширование

* Множитель при перехешировании тоже 2

---

# Проверим-ка!

![w:700 center](./images/demo.png)

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

# Map/Set: сложность

---

TODO

Перечислить в таблице (упомянуть перехеширование)

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

# Map/Set: память

---

# Как Map/Set хранятся в памяти?

```ts
interface CloseTable {
    hashTable: number[];
    dataTable: Entry[];
    nextSlot: number;
    size: number;
}
```

---

С точки зрения хранения данных в куче V8 Map/Set это всего лишь массивы

P.S. Отсюда следуют упомянутые ограничения на размеры

---

![w:1000 center](./images/map-memory-layout-1.png)

---

![w:1000 center](./images/map-memory-layout-2.png)

---

![w:1000 center](./images/map-memory-layout-3.png)

---

![w:1000 center](./images/map-memory-layout-4.png)

---

# Немного арифметики

Размер массива можно оценить примерно как:
* `N*3.5`, где `N` - емкость Map
* `N*2.5`, где `N` - емкость Set

---

# Входные условия

Для 64-битной системы (без учета [pointer compression](https://v8.dev/blog/pointer-compression)) каждый элемент массива занимает 8 байтов

---

# Итого

* Map с 2²⁰ (~1 млн.) пар займет ~29MB памяти
* Set с 2²⁰ (~1 млн.) элементов займет ~21MB памяти

---

TODO WeakMap/WeakSet

---

# Спасибо за внимание!

<!-- TODO update -->
![w:400 center](./images/slides-qr-code.png)

---

# Полезные ссылки

* https://itnext.io/v8-deep-dives-understanding-map-internals-45eb94a183df
* http://www.jucs.org/jucs_14_21/eliminating_cycles_in_weak/jucs_14_21_3481_3497_barros.pdf

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

# Bonus unlocked 🏅🏅🏅

---

# Map/Set: Map vs Object

|                          | Object | Map |
|--------------------------|--------|-----|
| Заранее известная структура | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✔️ | |
| Гарантированный&nbsp;порядок&nbsp;обхода | | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✔️* |
| Ключи&nbsp;произвольного&nbsp;типа | | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✔️ |
| Предсказуемая&nbsp;производительность при частых вставках/удалениях | | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✔️ |

\* С недавних пор (ES 2015, 2020) у объектов порядок обхода тоже гарантирован, но правила обхода сложнее
