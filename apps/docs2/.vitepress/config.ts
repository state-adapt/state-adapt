import { DefaultTheme, defineConfig } from 'vitepress';

import saDark from './theme/code-snippets/sa-dark.json';
import saLight from './theme/code-snippets/sa-light.json';
// This build-time metadata import cannot use the library's public TypeScript API.
// eslint-disable-next-line @nx/enforce-module-boundaries
import { version } from '../../../libs/core/package.json';
import typedocSidebar from '../docs/api/typedoc/typedoc-sidebar.json';
import adapterPaths from '../docs/api/core/adapters/symbol.paths';
import corePaths from '../docs/api/core/src/symbol.paths';
import eslintSpaghettiPaths from '../docs/api/eslint-plugin-spaghetti/index/symbol.paths';
import rxjsPaths from '../docs/api/rxjs/index/symbol.paths';
import spaghettiCorePaths from '../docs/api/spaghetti-core/index/symbol.paths';
import spaghettiAnalyzerPaths from '../docs/api/spaghetti-analyzer/index/symbol.paths';
import angularPaths from '../docs/api/angular/index/symbol.paths';
import reactPaths from '../docs/api/react/index/symbol.paths';
import apiPackages from '../docs/api/packages.json';
import { Section } from 'section-paths';
import { mdAngularTemplatesPlugin } from '../md-angular-templates.plugin';

function getLibSectionItems(sections: Section[]): DefaultTheme.SidebarItem[] {
  return sections.map(({ name, items }) => ({
    text: name,
    collapsed: true,
    items: items.map(item => ({
      text: item.def.symbol.split('-')[0], // Source and source too similar, so source-1 is used
      link: item.def.link,
    })),
  }));
}

const frameworks = {
  angular: 'Angular',
  react: 'React',
  solid: 'Solid',
  svelte: 'Svelte',
  vue: 'Vue',
};

type FrameworkKey = keyof typeof frameworks;
const frameworkKeys = Object.keys(frameworks) as FrameworkKey[];

export default defineConfig({
  vite: {
    plugins: [mdAngularTemplatesPlugin()],
  },
  lang: 'en-US',
  head: [
    ['link', { rel: 'icon', href: '/sa3-3.svg', sizes: 'any', type: 'image/svg+xml' }],
    ['link', { rel: 'mask-icon', href: '/sa3-3.svg', color: '#ffffff' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    // basic OG
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'StateAdapt' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'State Management that adapts with complexity.',
      },
    ],
    ['meta', { property: 'og:url', content: 'https://state-adapt.github.io/' }],
    [
      'meta',
      { property: 'og:image', content: 'https://state-adapt.github.io/sa-cover2.png' },
    ],
  ],
  title: 'StateAdapt',
  description: 'State Management that adapts with complexity.',
  srcDir: 'docs',
  srcExclude: ['**/api/typedoc/**'],
  rewrites: {
    // 'api/typedoc/:lib/src/:kind/:symbol': '/api/:lib/:symbol',
  },
  themeConfig: {
    logo: {
      src: '/sa3-3.svg',
      alt: 'StateAdapt Logo',
    },
    editLink: {
      pattern: ({ filePath, frontmatter }) =>
        frontmatter.definedIn
          ? 'https://github.com/state-adapt/state-adapt/tree/main/libs/' +
            frontmatter.definedIn.split('/libs/')[1]
          : 'https://github.com/state-adapt/state-adapt/tree/main/apps/docs2/docs/' +
            filePath,
      text: 'Suggest changes to this page',
    },
    nav: [
      {
        text: 'Guide',
        activeMatch: '^/guide',
        link: '/guide/overview/',
      },
      {
        text: 'API',
        activeMatch: '^/api',
        link: '/api/',
      },
      {
        text: `v${version}`,
        items: [
          {
            items: [
              {
                text: `v${version}`,
                link: `https://github.com/state-adapt/state-adapt/releases/tag/v${version}`,
              },
            ],
          },
          {
            component: 'VersionLinks',
            props: { currentMajor: version.split('.')[0] },
          },
        ],
      },
    ],

    sidebar: {
      api: getSidebar(),
      guide: getSidebar(),
    },
    search: {
      provider: 'local',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/state-adapt/state-adapt' }],
  },

  markdown: {
    theme: {
      // dark: 'dark-plus',
      dark: {
        name: 'sa-dark',
        settings: saDark.tokenColors,
      },
      light: {
        name: 'sa-light',
        settings: saLight.tokenColors,
      },
      // light: 'light-plus',
    },
  },
});

function getSidebar(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Guide',
      collapsed: false,
      items: getGuideSidebar(),
    },
    {
      text: 'API Reference',
      link: '/api/',
      collapsed: false,
      items: getApiSidebar(),
    },
  ];
}

function getGuideSidebar(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Overview',
      link: '/guide/overview',
    },
    {
      text: 'Thinking Reactively',
      base: '/guide/thinking-reactively/',
      collapsed: false,
      items: [
        {
          text: 'The Imperative Trap',
          link: 'imperative-trap',
        },
        {
          text: 'Imperative Conditioning',
          link: 'imperative-conditioning',
        },
        {
          text: 'The Reactivity Rule',
          link: 'the-reactivity-rule',
        },
        {
          text: 'Practice',
          link: 'practice',
        },
      ],
    },
    {
      text: 'Examples',
      link: '/guide/examples/',
    },
    {
      text: 'Getting Started',
      link: `/guide/getting-started/`,
    },
    {
      text: 'Upgrade Guide',
      link: '/guide/upgrade-guide',
    },
    ...getFrameworkSidebar('angular', [
      {
        text: 'StackBlitz Examples',
        link: 'stackblitz-examples',
      },
    ]),
    ...getFrameworkSidebar('react', [
      {
        text: 'Counter',
        link: 'counter',
      },
      {
        text: 'StackBlitz Examples',
        link: 'stackblitz-examples',
      },
    ]),
    ...getFrameworkSidebar('solid', []),
    ...getFrameworkSidebar('svelte', []),
    // ...getFrameworkSidebar('vue', []),
  ];
}

function getFrameworkSidebar(
  framework: FrameworkKey,
  examples: DefaultTheme.SidebarItem[],
): DefaultTheme.SidebarItem[] {
  return [
    {
      text: frameworks[framework],
      collapsed: true,
      base: `/guide/${framework}/`,
      items: [
        {
          text: 'Examples',
          base: `/guide/${framework}/examples/`,
          link: 'incremental-complexity',
          collapsed: true,
          items: [
            {
              text: 'Incremental Complexity',
              link: `incremental-complexity`,
            },
            ...examples,
          ],
        },
        {
          text: 'Getting Started',
          link: `getting-started`,
        },
      ],
    },
  ];
}

function getApiSidebar(): DefaultTheme.SidebarItem[] {
  const packageByName = new Map(apiPackages.map(pkg => [pkg.name, pkg]));
  const packageLink = (name: string) => packageByName.get(name)!.link;

  return [
    {
      text: '@state-adapt/core',
      link: packageLink('@state-adapt/core'),
      collapsed: true,
      items: [
        ...getLibSectionItems(corePaths.sections()),
        {
          text: 'Core Adapters',
          link: `/api/core/adapters/`,
          collapsed: true,
          items: getLibSectionItems(adapterPaths.sections()),
        },
      ],
    },
    {
      text: '@state-adapt/rxjs',
      link: packageLink('@state-adapt/rxjs'),
      collapsed: true,
      items: [...getLibSectionItems(rxjsPaths.sections())],
    },
    {
      text: '@state-adapt/angular',
      link: packageLink('@state-adapt/angular'),
      collapsed: true,
      items: [...getLibSectionItems(angularPaths.sections())],
    },
    {
      text: '@state-adapt/react',
      link: packageLink('@state-adapt/react'),
      collapsed: true,
      items: [...getLibSectionItems(reactPaths.sections())],
    },
    {
      text: '@state-adapt/spaghetti-core',
      link: packageLink('@state-adapt/spaghetti-core'),
      collapsed: true,
      items: [...getLibSectionItems(spaghettiCorePaths.sections())],
    },
    {
      text: '@state-adapt/eslint-plugin-spaghetti',
      link: packageLink('@state-adapt/eslint-plugin-spaghetti'),
      collapsed: true,
      items: [
        {
          text: 'no-spaghetti',
          link: '/api/eslint-plugin-spaghetti/rules/no-spaghetti',
        },
        ...getLibSectionItems(eslintSpaghettiPaths.sections()),
      ],
    },
    {
      text: '@state-adapt/spaghetti-analyzer',
      link: packageLink('@state-adapt/spaghetti-analyzer'),
      collapsed: true,
      items: [...getLibSectionItems(spaghettiAnalyzerPaths.sections())],
    },
    // { text: '@state-adapt/solid', link: `/api/solid` },
    // { text: '@state-adapt/svelte', link: `/api/svelte` },
    // { text: '@state-adapt/vue', link: `/api/vue` },
    process.env.NODE_ENV === 'development'
      ? {
          text: 'TypeDoc',
          link: '/api/typedoc/',
          items: typedocSidebar,
        }
      : {},
  ];
}
