import { Section } from '../../../../section-paths';

// Read apps/docs2/curated-api-docs.md before editing this file.
export const sections: Section[] = [
  {
    name: 'Global Configuration',
    items: ['ConfigureStateAdaptOptions', 'configureStateAdapt'],
  },
  {
    name: 'Sources',
    items: [
      'source-1',
      'Source',
      'type',
      'getRequestSources',
      'toRequestSource',
      'splitRequestSources',
    ],
  },
  {
    name: 'Stores',
    items: ['StateAdapt', 'joinStores'],
  },
  {
    name: 'Sources—Advanced',
    items: ['splitSources', 'catchErrorSource', 'toSource'],
  },
].map(({ name, items }) => ({
  name,
  items: items.map(symbol => ({
    params: { symbol },
    def: {
      symbol,
      path: `../../../api/typedoc/_state-adapt/rxjs/index/${symbol}.md`,
      link: `/api/rxjs/index/${symbol}`,
      section: name,
    },
  })),
}));
