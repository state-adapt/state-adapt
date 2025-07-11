let squaredSum = 0;

for (let i = 1; i <= 10; i++) {
  squaredSum += i ** 2;
}

setTimeout(() => {
  squaredSum = 100;
}, 1000);
