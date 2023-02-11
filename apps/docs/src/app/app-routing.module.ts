import { Injectable, NgModule } from '@angular/core';
import {
  PreloadAllModules,
  Router,
  RouterModule,
  Routes,
} from '@angular/router';
import { IntroComponent } from './intro/intro.component';

function getFrameworkRouteResolver(framework: string) {
  return {
    framework: framework + '-framework',
  };
}
function getFrameworkResolver(framework: string) {
  return () => {
    localStorage.setItem('framework', framework);
    return framework;
  };
}
function getFrameworkProvider(framework: string) {
  return {
    provide: framework + '-framework',
    useValue: getFrameworkResolver(framework),
  };
}
const frameworkProviders = ['angular', 'react', 'svelte', 'solid-js'].map(
  getFrameworkProvider,
);
@Injectable()
export class FrameworkRedirectGuard {
  constructor(private router: Router) {}
  canActivate() {
    const framework = localStorage.getItem('framework');
    return this.router.createUrlTree([`/${framework}`]);
  }
}

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [FrameworkRedirectGuard],
  },
  {
    path: 'concepts',
    children: [
      {
        path: 'overview',
        loadComponent: () =>
          import('./concepts/overview.component').then(
            m => m.ConceptsOverviewComponent,
          ),
      },
      {
        path: 'sources',
        loadComponent: () =>
          import('./concepts/sources.component').then(m => m.SourcesComponent),
      },
      {
        path: 'adapters',
        loadComponent: () =>
          import('./concepts/adapters.component').then(
            m => m.AdaptersComponent,
          ),
      },
      {
        path: 'stores',
        loadComponent: () =>
          import('./concepts/stores.component').then(m => m.StoresComponent),
      },
      {
        path: 'thinking-reactively',
        loadComponent: () =>
          import('./concepts/thinking-reactively.component').then(
            m => m.ThinkingReactivelyComponent,
          ),
      },
    ],
  },
  {
    path: 'adapters/:adapterName',
    loadComponent: () =>
      import('./adapters/adapters-core.component').then(
        m => m.AdaptersCoreComponent,
      ),
  },
  {
    path: 'docs',
    children: [
      {
        path: 'core',
        loadComponent: () =>
          import('./docs/docs-core.component').then(m => m.DocsCoreComponent),
      },
      {
        path: 'rxjs',
        loadComponent: () =>
          import('./docs/docs-rxjs.component').then(m => m.DocsRxjsComponent),
      },
    ],
  },
  {
    path: ':framework',
    component: IntroComponent,
  },
  {
    path: 'angular',
    resolve: getFrameworkRouteResolver('angular'),
    children: [
      {
        path: 'get-started',
        loadComponent: () =>
          import('./get-started/get-started-angular.component').then(
            m => m.GetStartedAngularComponent,
          ),
      },
      {
        path: 'demos',
        loadComponent: () =>
          import('./demos/demos-angular.component').then(
            m => m.DemosAngularComponent,
          ),
      },
      {
        path: 'docs',
        children: [
          {
            path: 'angular',
            loadComponent: () =>
              import('./docs/docs-angular.component').then(
                m => m.DocsAngularComponent,
              ),
          },
          {
            path: 'angular-router',
            loadComponent: () =>
              import('./docs/docs-angular-router.component').then(
                m => m.DocsAngularRouterComponent,
              ),
          },
          {
            path: 'ngrx',
            loadComponent: () =>
              import('./docs/docs-ngrx.component').then(
                m => m.DocsNgrxComponent,
              ),
          },
          {
            path: 'ngxs',
            loadComponent: () =>
              import('./docs/docs-ngxs.component').then(
                m => m.DocsNgxsComponent,
              ),
          },
        ],
      },
    ],
  },
  {
    path: 'react',
    resolve: getFrameworkRouteResolver('react'),
    children: [
      {
        path: 'get-started',
        loadComponent: () =>
          import('./get-started/get-started-react.component').then(
            m => m.GetStartedReactComponent,
          ),
      },
      {
        path: 'demos',
        loadComponent: () =>
          import('./demos/demos-react.component').then(
            m => m.DemosReactComponent,
          ),
      },
      {
        path: 'docs/react',
        loadComponent: () =>
          import('./docs/docs-react.component').then(m => m.DocsReactComponent),
      },
    ],
  },
  {
    path: 'svelte',
    resolve: getFrameworkRouteResolver('svelte'),
    children: [
      {
        path: 'get-started',
        loadComponent: () =>
          import('./get-started/get-started-svelte.component').then(
            m => m.GetStartedSvelteComponent,
          ),
      },
      {
        path: 'demos',
        loadComponent: () =>
          import('./demos/demos-svelte.component').then(
            m => m.DemosSvelteComponent,
          ),
      },
      {
        path: 'docs/svelte',
        loadComponent: () =>
          import('./docs/docs-svelte.component').then(
            m => m.DocsSvelteComponent,
          ),
      },
    ],
  },
  {
    path: 'solid-js',
    resolve: getFrameworkRouteResolver('solid-js'),
    children: [
      {
        path: 'get-started',
        loadComponent: () =>
          import('./get-started/get-started-solid-js.component').then(
            m => m.GetStartedSolidJsComponent,
          ),
      },
      {
        path: 'demos',
        loadComponent: () =>
          import('./demos/demos-solid-js.component').then(
            m => m.DemosSolidJsComponent,
          ),
      },
      {
        path: 'docs/solid-js',
        loadComponent: () =>
          import('./docs/docs-solid-js.component').then(
            m => m.DocsSolidJsComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'disabled',
      anchorScrolling: 'enabled',
      scrollOffset: [0, 50],
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  providers: [...frameworkProviders, FrameworkRedirectGuard], // Angular version was too early for inline resolver
  exports: [RouterModule],
})
export class AppRoutingModule {}
