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

# Embedded Time Series Storage:<br/>A Cookbook

## Andrey Pechkurov

![bg](./images/hazelcast-bg.jpg)

---

<!-- paginate: true -->

# About me

* Java (for a long time) and Node.js (for quite a long time) developer
* Node.js core collaborator
* Interests: web, system architecture, distributed systems, performance
* Can be found here:

  - https://twitter.com/AndreyPechkurov
  - https://github.com/puzpuzpuz
  - https://medium.com/@apechkurov

---

![h:80](./images/imdg-logo.jpg)

* Hazelcast IMDG Management Center (MC)
* Monitoring & management application for IMDG clusters
* Supports stand-alone and servlet container deployment
* Self-contained application, i.e. .jar file and Java is everything you need to run MC
* Frontend part is built with TypeScript, React and Redux
* Backend part is built with Java, Spring and IMDG Java client

---

<!-- # The topic

* For an upcoming version of MC we had to implement an embedded time series storage from existing components
* So, we are going to talk of considered options, experienced problems and technical decisions -->

# Agenda

* The problem
* Considered options
* Decisions made
* Current results
* Further plans

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

# The problem

---

# Terminology

**Metric** - a numerical value that can be measured at particular time and has a real world meaning. Examples: CPU load, used heap memory. Characterized by name and a set of tags.

**Data point** - a metric value measured at the given time. Characterized by metric, timestamp (Unix time) and a value.

---

# What we mean by "time series"

"Time series" (TS) stand for series of metric data points

```java
class DataPoint {

    String metric;
    List<Map.Entry<String, String>> tags;
    long time;
    long value;

}
```

---

# Sample data point

![center](./images/sample-data-point.png)

---

# Simple math

![center](./images/simple-math.png)

<!-- TODO describe problems related with time series data:
     large volume of data, lots of writes, less reads -->

---

<!-- describe popular storage formats -->

---

# The problem

* In the past IMDG clusters were reporting their metrics as a large JSON object
* MC was storing collected JSONs into a key-value storage (in-memory and/or JDBM)
* Such approach has some downsides that are critical for us
* Say, it requires changes in many places when we had to add new metrics

---

# The solution

IMDG v4.0+ is capable of reporting collected metrics (probes) to MC in a generic manner

![h:400 center drop-shadow](./images/jmx-metrics.png)

---

# The challenge

* MC has to store those metrics somehow
* Thus, we need a Time Series Storage
* Here comes the challenge...

---

# Requirements - must haves

* Embedded time series database or storage
* In-memory and optional persistent modes
* Data compression to achieve low disk footprint in the persistent mode
* Support data retention to avoid running of disk space
* Durability and fault tolerance in the persistent mode

---

# Requirements - nice to haves

* Good write performance (100Ks data points/second on average HW)
* Good enough read performance (10Ks data points/second on average HW)
* Use existing stable SW, when possible

---

<style scoped>
section h1 {
  position: absolute;
  top: 261px;
  left: 90px;
}
</style>

![bg](./images/hazelcast-bg-no-logo.jpg)

# Considered options

---

# TS DBs

* OpenTSDB
* InfluxDB
* TimescaleDB
* Prometheus
* Kdb+
* Graphite
* etc.

---

# Embedded TS DBs/storages

* Akumuli (C++) - https://akumuli.org
* QuestDB (Java) - https://www.questdb.io

---

<br/><br/>

# Call to Action

* You may want to give a try with IMDG and MC: https://hazelcast.org/
* Open source contributions are welcome as well!

---

# Спасибо за внимание!

<!-- TODO fix the code -->
![w:400 center](./images/slides-qr-code.png)

---

# Helpful links

* TBD
* https://blog.timescale.com/blog/time-series-compression-algorithms-explained/
