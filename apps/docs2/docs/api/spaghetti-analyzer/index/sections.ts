import { Section } from '../../../../section-paths';

// Read apps/docs2/curated-api-docs.md before editing this file.
export const sections: Section[] = [
  {
    name: 'Reports',
    items: [
      'createReport',
      'reportFromAnalysis',
      'formatHumanReport',
      'formatJsonReport',
      'createVisualizationDatasets',
    ],
  },
  {
    name: 'Options',
    items: ['ReportOptions', 'HistoricalSnapshot'],
  },
  {
    name: 'Results',
    items: [
      'SpaghettiReport',
      'DirectoryScore',
      'VisualizationDatasets',
      'RankedCommand',
    ],
  },
].map(({ name, items }) => ({
  name,
  items: items.map(symbol => ({
    params: { symbol },
    def: {
      symbol,
      path: `../../../api/typedoc/_state-adapt/spaghetti-analyzer/index/${symbol}.md`,
      link: `/api/spaghetti-analyzer/index/${symbol}`,
      section: name,
    },
  })),
}));
