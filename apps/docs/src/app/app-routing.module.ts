import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { IntroComponent } from './intro/intro.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: IntroComponent,
  },
  // {
  //   path: 'dashboards',
  //   loadChildren: () =>
  //     import('@state-adapt/dashboards-feature').then(
  //       m => m.DashboardsFeatureRoutingModule,
  //     ),
  // },
  {
    path: 'getting-started',
    loadComponent: () =>
      import('./getting-started/getting-started.component').then(
        m => m.GettingStartedComponent,
      ),
  },
  {
    path: 'demos',
    loadComponent: () => import('./demos/demos.component').then(m => m.DemosComponent),
  },
  {
    path: 'dashboards',
    loadChildren: () =>
      import('@state-adapt/dashboards-feature').then(
        m => m.DashboardsFeatureRoutingModule,
      ),
  },
  {
    path: 'concepts',
    children: [
      {
        path: 'overview',
        loadComponent: () =>
          import('./concepts/overview.component').then(m => m.ConceptsOverviewComponent),
      },
      {
        path: 'sources',
        loadComponent: () =>
          import('./concepts/sources.component').then(m => m.SourcesComponent),
      },
      {
        path: 'adapters',
        loadComponent: () =>
          import('./concepts/adapters.component').then(m => m.AdaptersComponent),
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
      import('./adapters/adapters-core.component').then(m => m.AdaptersCoreComponent),
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
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      scrollOffset: [0, 50],
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
