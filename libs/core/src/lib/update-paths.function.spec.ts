import { updatePaths } from './update-paths.function';
import { Update } from './adapt.actions';

const testCases: { inputs: [any, Update[]]; output: any }[] = [
  {
    inputs: [undefined, [[['x', 'a1', 'a2'], 2]]],
    output: { x: { a1: { a2: 2 } } },
  },
  {
    inputs: [{}, [[['x', 'a1', 'a2'], 2]]],
    output: { x: { a1: { a2: 2 } } },
  },
  {
    inputs: [{ x: { a1: { a2: 3 }, b1: 5 } }, [[['x', 'b1'], 2]]],
    output: { x: { a1: { a2: 3 }, b1: 2 } },
  },

  {
    inputs: [
      { x: { a1: { a2: 3 }, b1: 5 } },
      [
        [['x', 'a1'], 2],
        [['x', 'b1'], 10],
      ],
    ],
    output: { x: { a1: 2, b1: 10 } },
  },
  {
    inputs: [
      { x: { a1: { a2: 3 }, b1: 5 } },
      [
        [['x', 'a1', 'a2'], 2],
        [['x', 'a1', 'aa2'], 2],
      ],
    ],
    output: { x: { a1: { a2: 2, aa2: 2 }, b1: 5 } },
  },
  {
    inputs: [3, [[['x', 'a1', 'a2'], 2]]], // Shouldn't ever happen (3 initial state)
    output: { x: { a1: { a2: 2 } } },
  },
  {
    inputs: [
      3,
      [
        [['x', 'a1', 'a2'], 2],
        [[], 10],
      ],
    ], // Shouldn't ever happen (3 initial state)
    output: 10,
  },
  {
    inputs: [{ x: { a1: { a2: 3 }, b1: 5 } }, [[[''], 2]]], // Shouldn't ever happen (updating state with registered children)
    output: 2,
  },
  {
    inputs: [{ x: { a1: { a2: 3 }, b1: 5 } }, [[[], 2]]], // Shouldn't ever happen (updating state with registered children)
    output: 2,
  },
  {
    inputs: [{ x: { a1: { a2: 3 }, b1: 5 } }, [[['x'], 2]]],
    output: { x: 2 }, // Shouldn't ever happen (updating state with registered children)
  },
];

describe('updatePaths', () => {
  it('should update paths correctly for all test cases', () => {
    testCases.forEach(({ inputs, output }) =>
      expect(updatePaths(...inputs)).toEqual(output)
    );
  });
});
