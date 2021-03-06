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

# Немного об алгоритмах консенсуса.<br/>Казалось бы, при чем тут Node.js?

## Андрей Печкуров

![bg](./images/hazelcast-bg.jpg)

---

<!-- paginate: true -->

# Исходная задача

![h:600 center](./images/ap-lock-1.png)

---

# Исходная задача

![h:600 center](./images/ap-lock-2.png)

---

# Возможное решение

![h:600 center](./images/ap-lock-3.png)

---

# Возможное решение

![h:600 center](./images/ap-lock-4.png)

---

# Возможное решение

![h:600 center](./images/ap-lock-5.png)

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

![h:80](./images/imdg-logo.jpg)

# Hazelcast In-Memory Data Grid (IMDG)

* Большой набор распределенных структур данных
  - Показательный пример - `Map`, который часто используют как кэш

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

![h:80](./images/imdg-logo.jpg)

# Hazelcast In-Memory Data Grid (IMDG)

* Большой набор распределенных структур данных
  - Показательный пример - `Map`, который часто используют как кэш
* Особенности:
  - Хорошо масштабируется вертикально и горизонтально
  - Часто используется в high-load и low-latency приложениях

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

![h:80](./images/imdg-logo.jpg)

# Hazelcast In-Memory Data Grid (IMDG)

* Большой набор распределенных структур данных
  - Показательный пример - `Map`, который часто используют как кэш
* Особенности:
  - Хорошо масштабируется вертикально и горизонтально
  - Часто используется в high-load и low-latency приложениях
* Области применения:
  - Payment processing, fraud detection, IoT, in-memory<br/>stream processing и т.д.

---

<br/><br/>

# Hazelcast IMDG Node.js client

<style scoped>
section {
  background: #fff url(images/hazelcast-plus-node.jpg) no-repeat center 80px;
  background-size: 400px;
}
</style>

* https://github.com/hazelcast/hazelcast-nodejs-client
* P.S. А вот доклад про историю оптимизаций:<br/>https://youtu.be/CSnmpbZsVD4

---

# Старая реализация распределенных lock'ов

```js
const lock = await client.getLock('my-lock');

await lock.lock();
try {
    // "защищенный" код
    // (доступен только владельцу)
} finally {
    await lock.unlock();
}
```

---

# Хьюстон, у нас проблема

* В 2017м Kyle Kingsbury, автор Jepsen, проанализировал Hazelcast
* https://jepsen.io/analyses/hazelcast-3-8-3

---

# Как это работает в условиях network partition

![h:600 center](./images/ap-lock-partition-1.png)

---

# Как это работает в условиях network partition

![h:600 center](./images/ap-lock-partition-2.png)

---

# Как это работает в условиях network partition

![h:600 center](./images/ap-lock-partition-3.png)

---

# Наш ответ

* С версии 3.12 у нас есть CP Subsystem (т.е. production-ready Raft<br/>с Jepsen тестами и lock'ами 🙂)
* https://docs.hazelcast.org/docs/4.0.3/manual/html-single/index.html#cp-subsystem

---

# Новая реализация распределенных lock'ов

```js
// У ней внутри Raft
const lock = await client.getCPSubsystem().getLock('my-lock');

const fence = await lock.lock();
try {
    // "защищенный" код
    // (доступен только владельцу)
} finally {
    await lock.unlock(fence);
}
```

P.S. А еще у нас есть Semaphore, AtomicLong и AtomicReference.

---

![h:200 center](./images/raft-logo.png)

Raft - алгоритм консенсуса, придуманный D.Ongaro и J.Ousterhout<br/>(Stanford) в 2013.

---

![h:200 center](./images/raft-logo.png)

Некоторые юзкейсы для подобных алгоритмов:
  - Распределенные lock'и* (и не только)
  - Хранилище пар ключ-значение
  - Выбор лидера
  - Ограничения на значения полей (например, уникальность)
  - Атомарный коммит (распределенные транзакции)

---

# О докладчике

* Пишу на Java (очень долго), Node.js (долго)
* Node.js core collaborator
* Интересы: веб, архитектура, распределенные системы, производительность
* Можно найти тут:

  - https://twitter.com/AndreyPechkurov
  - https://github.com/puzpuzpuz
  - https://medium.com/@apechkurov

![bg right:33% fit](./images/silly-me.png)

---

# План на сегодня

👨‍🎓 Начинаем пугаться распределенных систем
👨‍🎓 Знакомимся с моделями согласованности
👨‍🎓 CAP теорема и прочие классификации
👨‍🎓 Что за зверь - алгоритм консенсуса?
🛠️ CASPaxos, как один из недавних Paxos-образных
🛠️ Pet-проект: CASPaxos на Node.js

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

➡️ __Начинаем пугаться распределенных систем__
👨‍🎓 Знакомимся с моделями согласованности
👨‍🎓 CAP теорема и прочие классификации
👨‍🎓 Что за зверь - алгоритм консенсуса?
🛠️ CASPaxos, как один из недавних Paxos-образных
🛠️ Pet-проект: CASPaxos на Node.js

---

# Упрощенная до ужаса история

![h:600 center](./images/general-timeline.png)

---

# Распределенная система

* Назовем распределенной систему, хранящую состояние (общее) на нескольких машинах, соединенных сетью
* Для определенности будем подразумевать хранилище пар ключ-значение

<!-- TODO проиллюстрировать хранилище и регистр -->

---

# Отличия: масштабирование

![h:450 center](./images/comparison-1.png)

---

# Отличия: работа с данными

![h:450 center](./images/comparison-2.png)

---

# Отличия: вероятность отказа

![h:450 center](./images/comparison-3.png)

---

# Отличия: критичность отказа

![h:450 center](./images/comparison-4.png)

---

# Fallacies of distributed computing

* Инженеры из Sun (R.I.P.) еще в 94м сформулировали такой список:
  - **The network is reliable**
  - **Latency is zero**
  - **Bandwidth is infinite**
  - The network is secure
  - Topology doesn't change
  - There is one administrator
  - Transport cost is zero
  - The network is homogeneous
* P.S. Добавим сюда "**Clocks are in sync**"

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Сеть 🌐

* Мы работаем с асинхронными сетями

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Сеть 🌐

* Мы работаем с асинхронными сетями
* Отправленный запрос может:
  - Быть потерян при отправке туда/обратно
  - Находиться в очереди ожидания отправки (если сеть под нагрузкой)
  - Быть получен, но машина-адресат дала сбой до или во время обработки

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Сеть 🌐

* Мы работаем с асинхронными сетями
* Отправленный запрос может:
  - Быть потерян при отправке туда/обратно
  - Находиться в очереди ожидания отправки (если сеть под нагрузкой)
  - Быть получен, но машина-адресат дала сбой до или во время обработки
* Единственный способ подтверждения - получить ответ

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Локальные 🕐

* Каждая машина работает с локальным временем (`Date.now()`)

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Локальные 🕐

* Каждая машина работает с локальным временем (`Date.now()`)
* Локальные монотонные часы (`process.hrtime()`) помогают, но далеко не всегда

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Локальные 🕐

* Каждая машина работает с локальным временем (`Date.now()`)
* Локальные монотонные часы (`process.hrtime()`) помогают, но далеко не всегда
* В действительности нам хотелось бы иметь глобальные часы

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Глобальные 🕐

* Увы, глобальные (синхронизированные) часы невозможны без специального железа
* Байка: в Google Spanner часы в ЦОД синхронизированы в пределах 7 мс (атомные часы + GPS)
* Оффтопик: векторные "часы" частично решают проблему

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Чего мы ждем от распределенной системы? 🤔

* Допустим, что мы ждем того же поведения, что и у централизованного хранилища
* А именно - с клиентской стороны поведение должно быть, как если бы это была централизованная система (пока остановимся на этой формулировке)

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Фигня вопрос - сейчас придумаем алгоритм

1. Любой узел принимает клиентские запросы (прочитать/записать)

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Фигня вопрос - сейчас придумаем алгоритм

1. Любой узел принимает клиентские запросы (прочитать/записать)
2. Затем - отправляет операцию на все остальные узлы

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Фигня вопрос - сейчас придумаем алгоритм

1. Любой узел принимает клиентские запросы (прочитать/записать)
2. Затем - отправляет операцию на все остальные узлы
3. Ждет ответов от большинства (консенсус жеж 😁)

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Фигня вопрос - сейчас придумаем алгоритм

1. Любой узел принимает клиентские запросы (прочитать/записать)
2. Затем - отправляет операцию на все остальные узлы
3. Ждет ответов от большинства (консенсус жеж 😁)
4. Дождавшись кворума, отправляет клиенту сообщение об успехе

---

# Что не так с нашим изобретением?

![h:600 center](./images/primitive-consensus-0.png)

---

# Что не так с нашим изобретением?

![h:600 center](./images/primitive-consensus-1.png)

---

# Что не так с нашим изобретением?

![h:600 center](./images/primitive-consensus-2.png)

---

# Что не так с нашим изобретением?

![h:600 center](./images/primitive-consensus-3.png)

---

# Что не так с нашим изобретением?

![h:600 center](./images/primitive-consensus-4.png)

---

# Что не так с нашим изобретением?

![h:600 center](./images/primitive-consensus-5.png)

---

# Что не так с нашим изобретением?

![h:600 center](./images/primitive-consensus-6.png)

---

# Что не так с нашим изобретением?

![h:600 center](./images/primitive-consensus-7.png)

---

# Что не так с нашим изобретением?

![h:600 center](./images/primitive-consensus-8.png)

---

# Что не так с нашим изобретением?

![h:600 center](./images/primitive-consensus-9.png)

---

# Что не так с нашим изобретением?

![h:600 center](./images/primitive-consensus-10.png)

---

# Что не так с нашим изобретением?

![h:600 center](./images/primitive-consensus-11.png)

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Начинаем пугаться распределенных систем -<br/>Промежуточные выводы 🤔

* Распределенные системы существенно отличаются от централизованных

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Начинаем пугаться распределенных систем -<br/>Промежуточные выводы 🤔

* Распределенные системы существенно отличаются от централизованных
* Нам не удалось с ходу придумать хороший алгоритм для распределенного хранилища

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}

s {
  color: #bfbfbf;
  text-decoration: none;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

✔️ ~~Начинаем пугаться распределенных систем~~
➡️ __Знакомимся с моделями согласованности__
👨‍🎓 CAP теорема и прочие классификации
👨‍🎓 Что за зверь - алгоритм консенсуса?
🛠️ CASPaxos, как один из недавних Paxos-образных
🛠️ Pet-проект: CASPaxos на Node.js

---

# Неформальное определение

Модель согласованности (consistency model) - это гарантии, которые система (внезапно, не только распределенная) предоставляет относительно набора поддерживаемых операций

---

![h:620 center](./images/consistency-models-1.png)

Source: https://jepsen.io/consistency

---

![h:620 center](./images/consistency-models-2.png)

Source: https://jepsen.io/consistency

---

![h:620 center](./images/consistency-models-3.png)

Source: https://jepsen.io/consistency

---

# Linearizable consistency model

* Одна из наиболее строгих (сильных) моделей согласованности для __одного__ объекта
* Именно ее мы и подразумевали (надеюсь) ранее:
  "с клиентской стороны поведение должно быть, как если бы это была централизованная система"

---

# Неформальное определение модели

Система гарантирует, что каждая операция выполняется атомарно, в __некотором__ (общем для всех клиентов) __порядке__, не противоречащим порядку выполнения операций в реальном времени.

Т.е. если операция A завершается до начала операции B, то B должна учитывать результат выполнения операции A.

---

# Допустимый порядок

![h:600 center](./images/linearizability-valid-1.png)

---

# Допустимый порядок

![h:600 center](./images/linearizability-valid-2.png)

---

# Допустимый порядок

![h:600 center](./images/linearizability-valid-3.png)

---

# Недопустимый порядок

![h:600 center](./images/linearizability-invalid.png)

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Знакомимся с моделями согласованности -<br/>Промежуточные выводы 🤔

* Моделей согласованности много

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Знакомимся с моделями согласованности -<br/>Промежуточные выводы 🤔

* Моделей согласованности много
* Многие из них связаны понятием строгости

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Знакомимся с моделями согласованности -<br/>Промежуточные выводы 🤔

* Моделей согласованности много
* Многие из них связаны понятием строгости
* Серебряной пули нет

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}

s {
  color: #bfbfbf;
  text-decoration: none;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

✔️ ~~Начинаем пугаться распределенных систем~~
✔️ ~~Знакомимся с моделями согласованности~~
➡️ __CAP теорема и прочие классификации__
👨‍🎓 Что за зверь - алгоритм консенсуса?
🛠️ CASPaxos, как один из недавних Paxos-образных
🛠️ Pet-проект: CASPaxos на Node.js

---

# CAP теорема

* Сформулирована Eric Brewer в 1998, как утверждение
* В 2002 появилось формальное доказательство

---

# Аббревиатура CAP

* Consistency: подразумевается линеаризуемость
* Availability: каждый запрос, полученный узлом системы, должен приводить к ожидаемому ответу (не к ошибке)
* Partition tolerance: подразумевается коммуникация через асинхронную сеть

---

# Partition tolerance

Network partition - сценарий, когда узлы продолжают функционировать, но некоторые из них не могут общаться между собой

<br/>

![h:300 center](./images/network-partition.png)

---

# Неформальное определение

В условиях network partition рассматриваемая система может быть:
* Доступна (AP)
* Согласована (CP)

P.S. CA опции в CAP теореме нет и в помине

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Критика

* Однобокая классификация, которая почему-то стала популярной

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Критика

* Однобокая классификация, которая почему-то стала популярной
* Например, РСУБД с одной read-only репликой не является ни CP, ни AP

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Критика

* Однобокая классификация, которая почему-то стала популярной
* Например, РСУБД с одной read-only репликой не является ни CP, ни AP
* Теорема ничего не говорит о времени отклика системы, т.е. AP система может отвечать сколь угодно медленно

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Критика

* Однобокая классификация, которая почему-то стала популярной
* Например, РСУБД с одной read-only репликой не является ни CP, ни AP
* Теорема ничего не говорит о времени отклика системы, т.е. AP система может отвечать сколь угодно медленно
* Наконец, network partition - далеко не единственный сценарий отказа

---

# Альтернативы

* PACELC теорема - расширение CAP теоремы (Daniel J. Abadi, 2010)
* PAC = PA | PC (та же CAP теорема)
* ELC = EL | EC:
  - E: else
  - L: latency
  - C: consistency

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# CAP теорема и прочие классификации -<br/>Промежуточные выводы 🤔

* Классификации позволяют рассуждать об общих чертах поведения

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# CAP теорема и прочие классификации -<br/>Промежуточные выводы 🤔

* Классификации позволяют рассуждать об общих чертах поведения
* Системы из одного и того же класса могут существенно отличаться

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}

s {
  color: #bfbfbf;
  text-decoration: none;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

✔️ ~~Начинаем пугаться распределенных систем~~
✔️ ~~Знакомимся с моделями согласованности~~
✔️ ~~CAP теорема и прочие классификации~~
➡️ __Что за зверь - алгоритм консенсуса?__
🛠️ CASPaxos, как один из недавних Paxos-образных
🛠️ Pet-проект: CASPaxos на Node.js

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Неформальное определение

* Алгоритм консенсуса - алгоритм, позволяющий узлам системы достигнуть консенсус, т.е. принять совместное решение __о том или ином__ действии

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Неформальное определение

* Алгоритм консенсуса - алгоритм, позволяющий узлам системы достигнуть консенсус, т.е. принять совместное решение __о том или ином__ действии
* Под действием часто понимают __однократное__ изменение регистра (Paxos)

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Неформальное определение

* Алгоритм консенсуса - алгоритм, позволяющий узлам системы достигнуть консенсус, т.е. принять совместное решение __о том или ином__ действии
* Под действием часто понимают __однократное__ изменение регистра (Paxos)
* С точки зрения отказов рассматривают только non-Byzantine faults

P.S. А еще есть "скандальный" FLP result (1985)

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Связь с linearizability

* На практике консенсус нужен на __последовательности__ действий

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Связь с linearizability

* На практике консенсус нужен на __последовательности__ действий
* Поэтому для реализаций встречается определение atomic broadcast (total order broadcast) - консенсус тут нужен для принятия решения о следующем действии
  - Можно показать, что linearizability и total order broadcast можно свести друг к другу

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Связь с linearizability

* На практике консенсус нужен на __последовательности__ действий
* Поэтому для реализаций встречается определение atomic broadcast (total order broadcast) - консенсус тут нужен для принятия решения о следующем действии
  - Можно показать, что linearizability и total order broadcast можно свести друг к другу
* А значит, мы говорим о CP системах, с точки зрения CAP теоремы

---

# Краткий список алгоритмов консенсуса

![h:600 center](./images/consensus-timeline.png)

---

# Верификация корректности: теория

* [TLA+](https://lamport.azurewebsites.net/tla/tla.html) (L.Lamport)
* Язык для моделирования программ и систем, распределенных и не только

```
EXTENDS TLC

(* --algorithm hello_world
variable s \in {"Hello", "World!"};
begin
  A:
    print s;
end algorithm; *)
```

![bg right:33% fit](./images/llamport.jpg)

---

# Верификация корректности: практика

* [Jepsen](https://github.com/jepsen-io/jepsen) (K.Kingsbury a.k.a. aphyr)

```
INFO  jepsen.core - Analysis invalid! (ﾉಥ益ಥ）ﾉ ┻━┻
```

Краткий список жертв:
* MongoDB
* Cassandra
* PostgreSQL
* Hazelcast
* Redis

![bg right:33% fit](./images/kkingsbury.png)

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Темная сторона алгоритмов консенсуса (｡▼皿▼)

* Производительность напрямую зависит от задержек сети

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Темная сторона алгоритмов консенсуса (｡▼皿▼)

* Производительность напрямую зависит от задержек сети
* Высокая сложность реализации и верификации

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Темная сторона алгоритмов консенсуса (｡▼皿▼)

* Производительность напрямую зависит от задержек сети
* Высокая сложность реализации и верификации
* Для работы кластера требуется строгое большинство узлов

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Что за зверь - алгоритм консенсуса? -<br/>Промежуточные выводы 🤔

* Различных алгоритмов консенсуса много

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Что за зверь - алгоритм консенсуса? -<br/>Промежуточные выводы 🤔

* Различных алгоритмов консенсуса много
* И алгоритм, и реализацию стоит верифицировать

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Что за зверь - алгоритм консенсуса? -<br/>Промежуточные выводы 🤔

* Различных алгоритмов консенсуса много
* И алгоритм, и реализацию стоит верифицировать
* Не надо пытаться решить любую проблему через консенсус

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}

s {
  color: #bfbfbf;
  text-decoration: none;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

✔️ ~~Начинаем пугаться распределенных систем~~
✔️ ~~Знакомимся с моделями согласованности~~
✔️ ~~CAP теорема и прочие классификации~~
✔️ ~~Что за зверь - алгоритм консенсуса?~~
➡️ __CASPaxos, как один из недавних Paxos-образных__
🛠️ Pet-проект: CASPaxos на Node.js

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# CASPaxos

* CASPaxos (D.Rystsov, 2018) - p2p, replicated state

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# CASPaxos

* CASPaxos (D.Rystsov, 2018) - p2p, replicated state
* CAS - compare-and-set/compare-and-swap

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# CASPaxos

* CASPaxos (D.Rystsov, 2018) - p2p, replicated state
* CAS - compare-and-set/compare-and-swap
* Модифицирует Paxos (Synod), а не просто использует его как компонент для построения системы

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/>

# Основы CASPaxos

* Использует один регистр (объект)

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/>

# Основы CASPaxos

* Использует один регистр (объект)
* Вводит несколько ролей для процессов:
  - Clients: клиенты системы, отправляют запросы к Proposer
  - Proposers: принимают запросы клиентов, генерируют уникальные номера (proposal ID) и общаются с Acceptors
  - Acceptors: могут принимать предложения Proposers, хранят принятое состояние

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/>

# Основы CASPaxos

* Использует один регистр (объект)
* Вводит несколько ролей для процессов:
  - Clients: клиенты системы, отправляют запросы к Proposer
  - Proposers: принимают запросы клиентов, генерируют уникальные номера (proposal ID) и общаются с Acceptors
  - Acceptors: могут принимать предложения Proposers, хранят принятое состояние
* Для сохранения работоспособности системы до `F` отказов, нужны `2F + 1` Acceptors

---

# Фаза 1

![w:1100 center](./images/caspaxos-phase-1-1.png)

---

# Фаза 1

![w:1100 center](./images/caspaxos-phase-1-2.png)

---

# Фаза 1

![w:1100 center](./images/caspaxos-phase-1-3.png)

---

# Фаза 1

![w:1100 center](./images/caspaxos-phase-1-4.png)

---

# Фаза 2

![w:1100 center](./images/caspaxos-phase-2-1.png)

---

# Фаза 2

![w:1100 center](./images/caspaxos-phase-2-2.png)

---

# Фаза 2

![w:1100 center](./images/caspaxos-phase-2-3.png)

---

# Фаза 2

![w:1100 center](./images/caspaxos-phase-2-4.png)

---

# Связь с Synod

CASPaxos эквивалентен Synod, если взять функцию:
```
x -> if x = ∅ then val0 else x
```

---

# CAS регистр на основе CASPaxos

Чтение:
```
x -> x
```

---

# CAS регистр на основе CASPaxos

Инициализация значением `val0`:
```
x -> if x = ∅ then (0, val0) else x
```

---

# CAS регистр на основе CASPaxos

Запись значения `val1` при условии версии `3`:
```
x -> if x = (3, *) then (4, val1) else x
```

---

# Хранилище пар ключ-значение на основе CASPaxos

* Хранилище - это набор именованных экземпляров CASPaxos, по одному на ключ
* Преимущества и недостатки подхода в сравнении с тем же Raft выходят за рамки доклада

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}

s {
  color: #bfbfbf;
  text-decoration: none;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

✔️ ~~Начинаем пугаться распределенных систем~~
✔️ ~~Знакомимся с моделями согласованности~~
✔️ ~~CAP теорема и прочие классификации~~
✔️ ~~Что за зверь - алгоритм консенсуса?~~
✔️ ~~CASPaxos, как один из недавних Paxos-образных~~
➡️ __Pet-проект: CASPaxos на Node.js__

---

# Gryadka

* https://github.com/gryadka/js
* ~500 строк JS и Lua кода
* Node.js для proposer'ов, Redis для acceptor'ов
* Внешняя коммуникация - HTTP

---

# Ogorod

* https://github.com/puzpuzpuz/ogorod
* 558 строк JS кода
* И proposers, и acceptors живут в одном экземпляре Node.js
* Данные хранятся in-memory
* Внешняя и внутренняя коммуникация - HTTP

---

# Пример использования

```bash
$ curl -X PUT http://localhost:8080/api/test \
  -H "Content-Type: application/json" \
  -d '{"foo":"bar"}'

{"version":0,"value":{"foo":"bar"}}
```

---

# Пример использования

```bash
$ curl -X POST http://localhost:8080/api/test/cas \
  -H "Content-Type: application/json" \
  -d '{"version":0,"value":{"bar":"baz"}}'

{"version":1,"value":{"bar":"baz"}}
```

---

# Чего не хватает до production-ready?

* Применить оптимизации для Paxos, например, CASPaxos 1RTT
* Поддержка динамической конфигурации, включая версионирование и сохранение на диск
* Поддержка операции delete. Нужен фоновый процесс аля GC (см. статью)
* Интеграция со встраиваемым хранилищем ключ-значение, например, RocksDB
* Перейти с коммуникации для внутренних нужд по HTTP к plain TCP
* Обработка ошибок и логирование
* И много чего еще

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Подходит ли Node.js для реализации алгоритмов консенсуса?

☑️ Хорошая производительность при I/O-bound нагрузке

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Подходит ли Node.js для реализации алгоритмов консенсуса?

☑️ Хорошая производительность при I/O-bound нагрузке
☑️ Зрелые стандартные модули и инструменты

---

<style scoped>
section {
  justify-content: flex-start;
}
</style>

<br/><br/>

# Подходит ли Node.js для реализации алгоритмов консенсуса?

☑️ Хорошая производительность при I/O-bound нагрузке
☑️ Зрелые стандартные модули и инструменты
☑️ Стабильная и развитая экосистема

---

<br/><br/>

# Призыв к действию

<style scoped>
section {
  background: #fff url(images/hazelcast-plus-node.jpg) no-repeat center 80px;
  background-size: 400px;
}
</style>

* Распределенных систем бояться - на server-side не ходить
* Все, кому интересны высокопроизводительные библиотеки<br/>(и распределенные системы) - welcome
* https://github.com/hazelcast/hazelcast-nodejs-client
* P.S. Contributions are welcome as well

---

# Спасибо за внимание!

![w:400 center](./images/slides-qr-code.png)

---

# Полезные книги и ссылки

* Designing Data-Intensive Applications, Martin Kleppmann, 2017
* CASPaxos: Replicated State Machines without logs, Denis Rystsov, 2018 - https://arxiv.org/abs/1802.07000
* Paxos Made Simple, Leslie Lamport, 2001 - https://lamport.azurewebsites.net/pubs/paxos-simple.pdf
* https://raft.github.io/raft.pdf
* https://jepsen.io
* https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html
* https://vadosware.io/post/paxosmon-gotta-concensus-them-all/

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

# Исторический бонус: Paxos и его подвиды, Raft

---

# Vanilla Paxos

* Paxos (1998) - p2p (leaderless)
* В основе - Synod/Single-Decree Paxos
* Позволяет принять строго одно решение (о значении регистра)
* Часто под Paxos подразумевают семейство алгоритмов

---

# Подвиды Paxos

* Multipaxos (2001)
* FastPaxos (2004~2005)
* Generalized Paxos (2004~2005)
* Mencius (2008)
* Multicoordinated Paxos (2006)
* Vertical Paxos (2009)
* Ring Paxos (2010) / Multi-Ring Paxos (2010)
* SPaxos (2012) / EPaxos (2013) / FPaxos (2016) / KPaxos (2017) / WPaxos (2017)
* __CASPaxos__ (2018)
* SDPaxos (2018)

---

# Raft

* Raft (2013) - single leader, replicated log
* Время делится на периоды (term), каждый из которых начинается в выбора лидера
* Упор сделан на простоту понимания алгоритма
* https://raft.github.io

![bg right:30% fit](./images/raft-logo.png)
