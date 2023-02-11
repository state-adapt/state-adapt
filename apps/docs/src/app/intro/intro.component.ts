import {
  AfterViewInit,
  Component,
  ViewChild,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { from } from 'rxjs';
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
import copilotSvg from 'raw-loader!../../assets/copilot.svg';

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
  m = import('../circuits/circuits.component').then(m =>
    this.circuitsContainer.createComponent(m.CircuitsComponent),
  );

  MOARRR = () => (window as any).MOARRR();

  frameworksMono = true;
  featuresMono = true;
  m2 = import('./set-up-scroll-colors.function').then(m =>
    m.setUpScrollColors(this),
  );

  domSanitizer = inject(DomSanitizer);
  frameworks = [
    {
      homeRouterLink: '/angular',
      docsRouterLink: '/angular/get-started',
      svg: angularSvg,
    },
    {
      homeRouterLink: '/react',
      docsRouterLink: '/react/get-started',
      svg: reactSvg,
    },
    {
      homeRouterLink: '/svelte',
      docsRouterLink: '/svelte/get-started',
      svg: svelteSvg,
    },
    {
      homeRouterLink: '/solid-js',
      docsRouterLink: '/solid-js/get-started',
      svg: solidSvg,
    },
  ].map(framework => ({
    ...framework,
    svg: this.domSanitizer.bypassSecurityTrustHtml(framework.svg),
  }));
  framework$ = inject(ActivatedRoute).params.pipe(
    map(p => p.framework),
    startWith('angular'),
    distinctUntilChanged(),
  );
  frameworks$ = this.framework$.pipe(
    map(framework =>
      this.frameworks.map(f => ({
        ...f,
        active: f.homeRouterLink.includes(framework),
      })),
    ),
  );

  features = [
    {
      href: '#1-start-with-simple-state',
      svg: reduxSvg,
      title: 'Redux DevTools for local state',
      description: `StateAdapt's unique approach to state management allows you to use Redux DevTools to inspect and debug both shared and local state.`,
    },
    {
      href: 'https://dev.to/this-is-angular/progressive-reactivity-in-angular-1d40',
      svg: declarativeSvg,
      title: '100% declarative syntax',
      description: `StateAdapt provides APIs for you to describe your state and side-effects completely declaratively, with as little boilerplate as possible.`,
    },
    {
      href: 'https://dev.to/this-is-learning/exciting-possibilities-with-state-adapters-3cia',
      svg: reusableLogicSvg,
      title: 'Reusable state logic',
      description: `Never write boolean toggle logic again. StateAdapt's utilities allow you to reuse state logic across your application.`,
    },
    {
      href: '#1-start-with-simple-state',
      svg: adaptiveSvg,
      title: 'Incremental Syntax',
      description: `Local, or global? Component, or Service? StateAdapt's flexible syntax eliminates the need to ask these stressful questions up-front.`,
    },
    {
      href: 'https://dev.to/this-is-learning/how-i-got-selectors-in-redux-devtools-443j',
      svg: selectorsSvg,
      title: 'Concise and efficient selectors',
      description: `StateAdapt uses proxies to memoize selectors and hook into Redux Devools, while enabling syntax that treats them like derived state itself.`,
    },
    {
      href: '',
      svg: lifecycleSvg,
      title: 'Fine-grained state lifecycle control',
      description: `If a store runs out of subscribers, it clears its state. This gives you convenient, fine-grained control over your state's lifecycle.`,
    },
    {
      href: 'https://twitter.com/mfpears/status/1615240298573221888',
      svg: copilotSvg,
      title: 'GitHub Copilot support',
      description: `Every StateAdapt utility has JSDocs comments with several clear examples fine-tuned to help Copilot generate useful code suggestions.`,
    },
  ].map(feature => ({
    ...feature,
    svg: this.domSanitizer.bypassSecurityTrustHtml(feature.svg),
  }));
  features$ = this.framework$.pipe(
    map(framework =>
      this.features.map(feature => ({
        ...feature,
        href: feature.href.startsWith('#')
          ? `${framework}${feature.href}`
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
