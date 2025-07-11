let squaredSum = 0;
let cubedSum = 0;

for (let i = 1; i <= 10; i++) {
  squaredSum += i ** 2;
  cubedSum += i ** 3;
}

setTimeout(() => {
  squaredSum = 100;
  cubedSum = 1000;
}, 1000);
