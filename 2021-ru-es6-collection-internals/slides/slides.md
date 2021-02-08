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

# Disclamer

* Изложение основано на V8 8.4, Node.js [commit 238104c](https://github.com/nodejs/node/commit/238104c531219db05e3421521c305404ce0c0cce)
* Полагаться можно (и нужно) только на спецификацию ECMAScript
* Автор не работает в команде V8

---

# План на сегодня

* Map/Set
  - Алгоритм
  - Особенности реализации
  - Сложность
  - Память
* WeakMap/WeakSet
  - Алгоритм
  - Особенности реализации

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

# Хеш-функция

![w:640 center](./images/hash-functions.png)

---

# Классическая хеш-таблица

* Хеш-таблица с цепочками
* Хеш-таблица с открытой адресацией

---

# Хеш-таблица с цепочками

![w:900 center](./images/hash-table.png)

---

# Перехеширование

* При достижении определенного размера таблицу нужно перехешировать
  - Емкость равна `коэффициент_заполнения * кол_во_ячеек`
* Новый размер таблицы при этом: `множитель * кол_во_ячеек`

---

# Что внутри у Map/Set?

В силу спецификации в Map/Set не может быть "классической" хеш-таблицы

---

# Фрагмент спецификации

> When the forEach method is called with one or two arguments, the following steps are taken:
> ...
> 7. Repeat for each Record {[[key]], [[value]]} e that is an element of entries, in original key **insertion order**

---

V8 реализует [deterministic hash table](https://wiki.mozilla.org/User:Jorend/Deterministic_hash_tables) (Tyler Close, 2012)

---

# Deterministic hash table

```java
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

![w:1000 center](./images/close-table-1.png)

---

![w:1000 center](./images/close-table-2.png)

---

![w:1000 center](./images/close-table-3.png)

---

![w:1000 center](./images/close-table-4.png)

---

![w:1000 center](./images/close-table-5.png)

---

![w:1000 center](./images/close-table-6.png)

---

![w:1000 center](./images/close-table-7.png)

---

![w:1000 center](./images/close-table-8.png)

---

![w:1000 center](./images/close-table-9.png)

---

![w:1000 center](./images/close-table-10.png)

---

![w:1000 center](./images/close-table-11.png)

---

![w:1000 center](./images/close-table-12.png)

---

![w:1000 center](./images/close-table-13.png)

---

# Перехеширование при увеличении таблицы

![w:1000 center](./images/close-table-14.png)

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

* Емкость это всегда степень двойки
* Коэффициент заполнения равен 2
  - Емкость равна `2 * кол_во_ячеек`

---

# Границы

* Начальная емкость: `new Map()` содержит 2 ячейки (емкость равна 4)
* Максимальная емкость: на 64-битной системе емкость Map ограничена 2²⁷ (~16.7 млн.  пар)

---

# Перехеширование

* Множитель при перехешировании тоже 2
  - Таблица увеличивается/уменьшается в 2 раза

---

Экспериментальная [ветка](https://github.com/puzpuzpuz/node/tree/experiment/expose-map-capacity) Node.js

![w:717 center](./images/experimental-branch.png)

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

# Big O

|            | В среднем случае | В худшем случае |
|------------|------------------|-----------------|
| Поиск      | O(1)             | O(n)            |
| Вставка*   | O(1)             | O(n)            |
| Удаление** | O(1)             | O(n)            |

\* Может привести к увеличению таблицы
\** Может привести к уменьшению таблицы

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

```java
interface CloseTable {
    hashTable: number[];
    dataTable: Entry[];
    nextSlot: number;
    size: number;
}
```

---

С точки зрения хранения данных в куче V8 Map/Set это JS массивы

P.S. Отсюда следует ограничение на размеры

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
* `3.5*N`, где `N` - емкость Map
* `2.5*N`, где `N` - емкость Set

---

# Входные условия

Для 64-битной системы (без учета [pointer compression](https://v8.dev/blog/pointer-compression)) каждый элемент массива занимает 8 байтов

---

# Итого

* Map с 2²⁰ (~1 млн.) пар займет ~29MB памяти
* Set с 2²⁰ (~1 млн.) элементов займет ~21MB памяти

---

# Map/Set в сухом остатке

* В основе - deterministic hash table
* Алгоритмическая сложность такая же, как у "классической" хеш-таблицы
* Размер - степерь двойки
* Коэффициент заполненности и множители тоже равны 2
* Потребление памяти - умеренное

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

# WeakMap/WeakSet: алгоритм

---

![w:1024 center](./images/weak-ref.png)

---

Так почему бы не взять Map + WeakRef в основу WeakMap?

---

# Map + WeakRef

![w:850 center](./images/weak-hash-map-1.png)

---

# Map + WeakRef: поведение при GC

![w:850 center](./images/weak-hash-map-2.png)

---

# Map + WeakRef: проблема

![w:850 center](./images/weak-hash-map-3.png)

---

# Внимание, ответ

На помощь спешит механизм [ephemeron](https://en.wikipedia.org/wiki/Ephemeron)*

\* Справка: можно встретить в Lua и .NET

---

# Ephemeron это пара

![w:700 center](./images/ephemeron-references.png)

---

# Начнем издалека

В основе GC в V8 - трёхцветный (tri-color) [алгоритм](https://dl.acm.org/doi/10.1145/359642.359655) отметки<br/>(Э.В. Дейкстра, 1978)

---

# Tricolor marking

![h:600 center](./images/tricolor-marking-1.png)

---

# Tricolor marking

![h:600 center](./images/tricolor-marking-2.png)

---

# Tricolor marking

![h:600 center](./images/tricolor-marking-3.png)

---

Как сборщик обрабатывает ephemeron'ы?

---

# Обработка ephemeron

![h:600 center](./images/ephemeron-marking-1.png)

---

# Обработка ephemeron

![h:600 center](./images/ephemeron-marking-2.png)

---

```js
function convergeEphemerons(queue) {
  while (true) {
    let changed = false;

    for (const weakMap of queue) {
      if (traverseEphemeron(weakMap)) {
        changed = true;
        // tri-color marking для помеченных значений
        propagateAll(/*...*/);
      }
    }

    if (!changed) break;
  }
}
```

---

```js
function traverseEphemeron(weakMap) {
  let marked = false;

  // прим.: такого публичного API не существует
  for (let [key, value] of weakMap) {
    if (isMarked(key)) {
      mark(value);
      marked = true;
    }
  }

  return marked;
}
```

<!-- ---

<style scoped>
section::before {
  width: 1100px;
  height: 30px;
  background-color: rgba(235, 225, 52, 0.1);
  border: 1px solid #73736e;
  position: absolute;
  top: 0px;
  left: 0px;
}
</style>

```js
function traverseEphemeron(weakMap) {
  let marked = false;

  // прим.: такого публичного API не существует
  for (let [key, value] of weakMap) {
    if (isMarked(key)) {
      mark(value);
      marked = true;
    }
  }

  return marked;
}
``` -->

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

# WeakMap/WeakSet: особенности реализации

---

* WeakMap/WeakSet:
  - [EphemeronHashTable](https://github.com/nodejs/node/blob/238104c531219db05e3421521c305404ce0c0cce/deps/v8/src/objects/hash-table.h#L378)
  - [MarkingVisitorBase::VisitEphemeronHashTable](https://github.com/nodejs/node/blob/238104c531219db05e3421521c305404ce0c0cce/deps/v8/src/heap/marking-visitor-inl.h#L258)
  - [MarkCompactCollector::ProcessEphemeronsUntilFixpoint, ProcessEphemeronsLinear, ProcessEphemeron](https://github.com/nodejs/node/blob/238104c531219db05e3421521c305404ce0c0cce/deps/v8/src/heap/mark-compact.cc)
* WeakRef:
  - [MarkingVisitorBase::VisitJSWeakRef](https://github.com/nodejs/node/blob/238104c531219db05e3421521c305404ce0c0cce/deps/v8/src/heap/marking-visitor-inl.h#L297)
  - [MarkCompactCollector::ClearJSWeakRefs](https://github.com/nodejs/node/blob/238104c531219db05e3421521c305404ce0c0cce/deps/v8/src/heap/mark-compact.cc#L2472)

---

# Что же такое WeakMap/WeakSet?

Формально - "классическая" хеш-таблица с открытой адресацией и квадратичным пробированием

---

# "Цена" WeakMap/WeakSet

* Когда нет циклов, WeakMap/WeakSet равнозначны Map + WeakRef
* Когда циклы есть, стоимость GC возрастает (вплоть до квадратичной)
  - С другой стороны, Map + WeakRef не может обработать циклы

---

# WeakMap/WeakSet в сухом остатке

* В основе - хеш-таблица с открытой адресацией + ephemeron
* Алгоритмическая сложность операций: как у "классической" хеш-таблицы
* Алгоритмическая сложность GC: O(n) (O(n^2) в худшем случае)

---

# Спасибо за внимание!

![w:400 center](./images/slides-qr-code.png)

---

# Полезные ссылки

* https://itnext.io/v8-deep-dives-understanding-map-internals-45eb94a183df
* http://www.jucs.org/jucs_14_21/eliminating_cycles_in_weak/jucs_14_21_3481_3497_barros.pdf
* https://v8.dev/blog/concurrent-marking

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

# Пустая хеш-таблица с цепочками

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

# Поиск

![w:1000 center](./images/hash-table-5.png)

---

# Map vs Object

|                          | Object | Map |
|--------------------------|--------|-----|
| Заранее известная структура | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✔️ | |
| Гарантированный&nbsp;порядок&nbsp;обхода | | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✔️* |
| Ключи&nbsp;произвольного&nbsp;типа | | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✔️ |
| Предсказуемая&nbsp;производительность при частых вставках/удалениях | | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;✔️ |

\* С недавних пор (ES 2015, 2020) у объектов порядок обхода тоже гарантирован, но правила обхода сложнее
