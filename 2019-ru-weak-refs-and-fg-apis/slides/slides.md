---
marp: false
theme: default
---

<style>
section.lead h1 {
  padding-top: 69px;
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

# Немного шалим со свежими<br/>WeakRef и FinalizationGroup API

## Андрей Печкуров

![bg](./images/hazelcast-bg.jpg)

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

# План на сегодня

* История вопроса
* Знакомство с WeakRef и FinalizationGroup API
* Простые примеры использования
* Шалости: Buffer pool для Node.js

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

# История вопроса

---

TODO

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

# Знакомство с WeakRef и FinalizationGroup API

---

TODO

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

# Простые примеры использования

---

TODO

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

# Шалости: Buffer pool для Node.js

---

TODO

---

![h:80](./images/imdg-logo.jpg)

* Hazelcast In-Memory Data Grid (IMDG)
* Большой набор распределенных структур данных
* Показательный пример - `Map`, который часто используют как кэш
* Написана на Java, умеет embedded и standalone режимы
* Хорошо масштабируется вертикально и горизонтально
* Часто используется в high-load и low-latency приложениях
* Области применения: IoT, in-memory stream processing, payment processing, fraud detection и т.д.

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
* Доклад про историю оптимизаций
  - Видео: https://youtu.be/CSnmpbZsVD4
  - Слайды: https://github.com/puzpuzpuz/talks/tree/master/2019-ru-nodejs-library-optimization

---

# Спасибо за внимание!

![w:400 center](./images/slides-qr-code.png)

---

# Полезные ссылки

TODO
