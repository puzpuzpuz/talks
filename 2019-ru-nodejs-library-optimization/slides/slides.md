---
marp: true
theme: default
---

<style>
img[alt~="center"] {
  display: block;
  margin: 0 auto;
}
</style>

# История одной оптимизации производительности Node.js библиотеки

### Андрей Печкуров, Hazelcast

---

<!-- paginate: true -->

# О докладчике

* Пишу на Java (10+ лет), Node.js (5+ лет)
* Интересы: веб, архитектура, распределенные системы, производительность
* Можно найти тут:

  - https://twitter.com/AndreyPechkurov
  - https://github.com/puzpuzpuz
  - https://medium.com/@apechkurov

---

# О докладе

* Тема: оптимизация производительности Node.js библиотек/приложений
* Подопытный: Node.js клиентская библиотека Hazelcast IMDG
* Аудитория: все, кто разрабатывает сетевые приложения на Node.js
* План:

  1. Знакомство с подопытным
  2. Цели и общий подход
  3. Бенчмарки и инструменты анализа
  4. Оптимизация: гипотезы, эксперименты, результаты
  5. Планы на будущее

---

# 1. Знакомство с подопытным

---

# Hazelcast IMDG

TODO: описать

---

# Архитектура Hazelcast IMDG

![w:920 center drop-shadow](./images/imdg-architecture.png)

---

# Возможности Hazelcast IMDG

![w:1100 center drop-shadow](./images/imdg-architecture-zoomed.png)

---

# Hazelcast IMDG Node.js client

* https://github.com/hazelcast/hazelcast-nodejs-client
* Node.js 4+
* Стек: TypeScript, promisified API (bluebird)
* Первый стабильный релиз - май 2019

---

# Особенности библиотеки

* "Умная" клиентская библиотека
* Общается с нодами кластера по [открытому бинарному протоколу](https://hazelcast.org/documentation/#open-binary) поверх TCP
* Поддерживает множество распределенных структур данных

---

# Пример использования

```javascript
const Client = require('hazelcast-client').Client;

const client = await Client.newHazelcastClient();
const cache = await client.getMap('my-awesome-cache');

await cache.set('foo', 'bar');
const cached = await cache.get('foo');
```

---

# 2. Цели и общий подход

---

# Начальные цели

* Анализ текущей производительности перед стабильным релизом
* Включение в релиз "быстрых" правок (при необходимости)
* Постановка планов по дальнейшему анализу и оптимизации
* *Спойлер*: большая часть из этих планов уже реализована

---

# Оптимизация?

![w:1000 center drop-shadow](./images/i-have-no-idea.jpg)

---

# Оптимизация? Рецепт приготовления

0. Определить метрики производительности и, по возможности, желаемые значения
1. Реализовать бенчмарк
2. Сделать замеры
3. Проблема? Подобрать инструменты анализа
4. Найти ботлнеки, выдвинуть гипотезы и провести эксперименты
5. Сделать замеры
6. `goto 0.`

---

# Возможные метрики

* Сетевая клиентская библиотека
* I/O bound нагрузка
* Основные метрики:

  - Операции в секунду (throughput)
  - Время выполнения операции (~latency)

* Вспомогательные метрики:

  - Загрузка процессора
  - Потребление памяти

---

# Выбор метрик?

* Оптимизируем throughput
* Желаемые значения: `¯\_(ツ)_/¯`

---

# Выбор метрик!

![w:800 center drop-shadow](./images/gotta-go-fast.jpg)

---

# 3. Бенчмарки и инструменты анализа

---

# Старый бенчмарк

```javascript
var key = Math.random() * ENTRY_COUNT;
var opType = Math.floor(Math.random() * 100);
if (opType < GET_PERCENTAGE) {
    this.map.get(key).then(this.increment.bind(this));
}
// ...
setImmediate(this.run.bind(this));
```

---

# Старый бенчмарк: минусы

* Зависимость от `setImmediate()`
* Нет ограничений по кол-ву операций (concurrency limit, backpressure)
* Операции и значения выбираются случайным образом
* Это снижает результаты и детерменистичность

---

# Новый бенчмарк

```javascript
const benchmark = new Benchmark({
    nextOp: () => map.get('foo'),
    totalOpsCount: REQ_COUNT,
    batchSize: BATCH_SIZE
});
await benchmark.run();
```

---

# Новый бенчмарк: визуализация

TODO: сделать картинку (+ написать про варьирование totalOpsCount и batchSize, а также про perf timers API)

```text
op1--->|op6--->| finish
op2->|op4------>| finish
op3->|op5-->|op7->| finish
```

---

# Сценарий

* Приложение-бенчмарк
* Кластер из одной ноды IMDG 3.12 (Docker контейнер)
* Запуск на локальной машине (loopback address)
* Операции: `IMap.get()` и `IMap.set()`
* Данные: фиксированные строки с ASCII-символами
* Замер: несколько запусков и вычисление среднего результата
