const obj = {
  count: 0,
};

obj.count++;

function increment() {
  obj.count++;
}

function incrementTwice() {
  increment();
  increment();
}

function incrementThrice() {
  incrementTwice();
  increment();
}

incrementThrice();

console.log(`Final count: ${obj.count}`); // Final count: 3
