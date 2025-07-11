const squared = [] as number[];

for (let i = 1; i <= 3; i++) {
  squared.push(i ** 2);
}

setTimeout(() => {
  squared.push(100);
}, 1000);
