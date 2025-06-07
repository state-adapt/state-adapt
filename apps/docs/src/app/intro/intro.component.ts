import {
  AfterViewInit,
  Component,
  ViewChild,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { from, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  startWith,
  switchAll,
} from 'rxjs/operators';

import reduxSvg from 'raw-loader!../../assets/redux-devtools-logo.svg';
import declarativeSvg from 'raw-loader!../../assets/declarative-syntax.svg';
import reusableLogicSvg from 'raw-loader!../../assets/reusable-logic.svg';
import adaptiveSvg from 'raw-loader!../../assets/adaptive-syntax.svg';
import selectorsSvg from 'raw-loader!../../assets/selectors.svg';
import lifecycleSvg from 'raw-loader!../../assets/fine-grained-lifecycle.svg';
// import copilotSvg from 'raw-loader!../../assets/copilot.svg';

import angularSvg from 'raw-loader!../../assets/angular.svg';
import reactSvg from 'raw-loader!../../assets/react.svg';
import svelteSvg from 'raw-loader!../../assets/svelte.svg';
import solidSvg from 'raw-loader!../../assets/solidjs.svg';

function useFrameworkExampleDocs() {
  const activatedRoute = inject(ActivatedRoute);
  const router = inject(Router);

  return from(
    import('./set-up-framework.function').then(m =>
      m.setUpFramework(activatedRoute, router),
    ),
  ).pipe(switchAll());
}

const frameworks = [
  {
    name: 'angular',
    title: 'Angular',
    homeRouterLink: '/angular',
    docsRouterLink: '/angular#main-content',
    svg: angularSvg,
  },
  {
    name: 'react',
    title: 'React',
    homeRouterLink: '/react',
    docsRouterLink: '/react#main-content',
    svg: reactSvg,
  },
  {
    name: 'svelte',
    title: 'Svelte',
    homeRouterLink: '/svelte',
    docsRouterLink: '/svelte#main-content',
    svg: svelteSvg,
  },
  {
    name: 'solid-js',
    title: 'SolidJS',
    homeRouterLink: '/solid-js',
    docsRouterLink: '/solid-js#main-content',
    svg: solidSvg,
  },
] as const;

const features = [
  {
    href: 'START',
    svg: adaptiveSvg,
    title: 'Adaptive',
    description: `Local or global? Component or Service? StateAdapt's flexible syntax eliminates the need to ask these annoying questions up front.`,
  },
  {
    href: 'https://dev.to/this-is-angular/progressive-reactivity-in-angular-1d40',
    svg: declarativeSvg,
    title: 'Declarative',
    description: `StateAdapt's APIs lets you describe your state and side-effects almost completely declaratively, with as little boilerplate as possible.`,
  },
  {
    href: '',
    svg: lifecycleSvg,
    title: 'Automatic',
    description: `If a store runs out of subscribers, it clears its state. When it gets new subscribers, it re-initializes. No need for external management.`,
  },
  {
    href: 'https://dev.to/this-is-learning/exciting-possibilities-with-state-adapters-3cia',
    svg: reusableLogicSvg,
    title: 'Reusable',
    description: `Never write boolean toggle logic again. StateAdapt's utilities allow you to reuse state logic across your application.`,
  },
  {
    href: 'https://dev.to/this-is-learning/how-i-got-selectors-in-redux-devtools-443j',
    svg: selectorsSvg,
    title: 'Concise and Efficient',
    description: `StateAdapt uses proxies to memoize selectors and hook into Redux DevTools, while enabling extremely concise syntax.`,
  },
  {
    href: 'START',
    svg: reduxSvg,
    title: 'Redux DevTools',
    description: `StateAdapt's unique approach allows you to use Redux DevTools to inspect and debug both global and local state.`,
  },
  // {
  //   href: 'https://twitter.com/mfpears/status/1615240298573221888',
  //   svg: copilotSvg,
  //   title: 'GitHub Copilot support',
  //   description: `Every StateAdapt utility has JSDoc comments with several clear examples fine-tuned to help Copilot generate useful code suggestions.`,
  // },
];

@Component({
  selector: 'sa-intro',
  templateUrl: `./intro.component.html`,
  styleUrls: ['./intro.component.scss'],
  providers: [],
})
export class IntroComponent implements AfterViewInit {
  public viewContainerRef = inject(ViewContainerRef);
  @ViewChild('circuitsContainer', { static: true, read: ViewContainerRef })
  circuitsContainer!: ViewContainerRef;
  // m = import('../circuits/circuits.component').then(m =>
  //   this.circuitsContainer.createComponent(m.CircuitsComponent),
  // );

  MOARRR = () => (window as any).MOARRR();

  frameworksMono = true;
  featuresMono = true;
  timeout1 = setTimeout(() => {
    this.frameworksMono = false;
    this.featuresMono = false;
  }, 1_500);
  // m2 = import('./set-up-scroll-colors.function').then(m =>
  //   m.setUpScrollColors(this),
  // );

  domSanitizer = inject(DomSanitizer);
  frameworks = frameworks.map(framework => ({
    ...framework,
    svg: this.domSanitizer.bypassSecurityTrustHtml(framework.svg),
  }));
  framework$ = inject(ActivatedRoute).params.pipe(
    map(p => p.framework),
    startWith('angular'),
    distinctUntilChanged(),
  ) as Observable<typeof this.frameworks[number]['name']>;
  frameworkTitle$ = this.framework$.pipe(
    map(framework => this.frameworks.find(f => f.name === framework)?.title!),
  );
  frameworkGetStartedLink$ = this.framework$.pipe(
    map(
      framework =>
        this.frameworks.find(f => f.homeRouterLink.includes(framework))
          ?.docsRouterLink,
    ),
  );
  frameworks$ = this.framework$.pipe(
    map(framework =>
      this.frameworks.map(f => ({
        ...f,
        active: f.homeRouterLink.includes(framework),
      })),
    ),
  );

  features = features.map(feature => ({
    ...feature,
    svg: this.domSanitizer.bypassSecurityTrustHtml(feature.svg),
  }));
  frameworkStarts = {
    angular: '/angular/#1-start-with-simple-state',
    react: '/react/#usestate-without-regrets',
    svelte: '/svelte/#1-start-with-simple-state',
    'solid-js': '/solid-js/#1-start-with-simple-state',
  };
  features$ = this.framework$.pipe(
    map(framework =>
      this.features.map(feature => ({
        ...feature,
        href:
          feature.href === 'START'
            ? this.frameworkStarts[framework]
            : feature.href,
      })),
    ),
    startWith(this.features),
  );
  trackByTitle = (i: number, feature: typeof this.features[number]) =>
    feature.title;

  frameworkExampleDocs$ = useFrameworkExampleDocs();
  ngAfterViewInit() {
    [...(document as any).querySelectorAll('video')].forEach(
      v => (v.playbackRate = 0.5) && (v.style.cssText = 'minHeight: 700px'),
    );
  }

  introGeneralDocs$ = import('./intro-general-docs.md').then(m => m.default);
}
