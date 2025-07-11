const event$ = timer(1000);

const initialSquared = [1, 2, 3].map(i => i ** 2);
const squared$ = concat(
  of(initialSquared),
  event$.pipe(map(() => initialSquared.concat([100]))),
);

const initialCubed = [1, 2, 3].map(i => i ** 3);
const cubed$ = concat(
  of(initialCubed),
  event$.pipe(map(() => initialCubed.concat([1000]))),
);
