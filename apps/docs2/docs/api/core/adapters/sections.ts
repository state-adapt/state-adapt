import { Section } from '../../../../section-paths';

export const sections: Section[] = [
  {
    name: 'Primitive Adapters',
    items: [
      'booleanAdapter',
      'baseBooleanAdapter',
      'numberAdapter',
      'baseNumberAdapter',
      'stringAdapter',
      'baseStringAdapter',
    ],
  },
  {
    name: 'Entity Adapter',
    items: ['createEntityAdapter', 'createEntityState', 'EntityState'],
  },
].map(({ name, items }) => ({
  name,
  items: items.map(symbol => ({
    params: { symbol },
    def: {
      symbol,
      path: `../../../api/typedoc/_state-adapt/core/adapters/src/${symbol}.md`,
      link: `/api/core/adapters/${symbol}`,
      section: name,
    },
  })),
}));
