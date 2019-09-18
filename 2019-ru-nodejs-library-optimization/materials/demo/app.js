const Benchmark = require('benchmark');
const suite = new Benchmark.Suite();

suite
  .add('my awesome microbenchmark', () => cpuIntensiveFn(1000))
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .run();

function cpuIntensiveFn (n) {
  let a = 1, b = 0, tmp;
  while (n >= 0) {
    tmp = a;
    a = a + b;
    b = tmp;
    n--;
  }
  return b;
}
