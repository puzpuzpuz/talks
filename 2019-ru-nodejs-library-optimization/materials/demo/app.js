const Benchmark = require('benchmark');
const suite = new Benchmark.Suite();

suite
  .add('my awesome microbenchmark', cpuIntensiveFn)
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .run();

function cpuIntensiveFn () {
  return fibonacci(1000);
}

function fibonacci (n) {
  let a = 1, b = 0, tmp;
  while (n >= 0) {
    tmp = a;
    a = a + b;
    b = tmp;
    n--;
  }
  return b;
}
