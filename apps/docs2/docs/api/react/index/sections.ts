import { Section } from '../../../../section-paths';

// Read apps/docs2/curated-api-docs.md before editing this file.
export const sections: Section[] = [
  {
    name: 'Store',
    items: ['useAdapt', 'adapt', 'useStore', 'watch'],
  },
  {
    name: 'Events',
    items: ['useSource', 'useObservable'],
  },
  {
    name: 'Shared Derived State',
    items: ['derive', 'useDerived'],
  },
  {
    name: 'Global Configuration',
    items: ['createStateAdapt', 'defaultStateAdapt', 'AdaptContext'],
  },
].map(({ name, items }) => ({
  name,
  items: items.map(symbol => ({
    params: { symbol },
    def: {
      symbol,
      path: `../../../api/typedoc/_state-adapt/react/index/${symbol}.md`,
      link: `/api/react/index/${symbol}`,
      section: name,
    },
  })),
}));
