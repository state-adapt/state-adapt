const squared = [] as number[];
const cubed = [] as number[];

for (let i = 1; i <= 3; i++) {
  squared.push(i ** 2);
  cubed.push(i ** 3);
}

setTimeout(() => {
  squared.push(100);
  cubed.push(1000);
}, 1000);
