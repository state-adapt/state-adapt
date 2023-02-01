import { Location } from '@angular/common';
import { Component, Injector } from '@angular/core';
import { Event, Router, RouterEvent } from '@angular/router';
import { merge, Subject } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { setColorScheme } from './set-color-scheme.function';
import asleepIcon from 'raw-loader!../assets/asleep.svg';
import awakeIcon from 'raw-loader!../assets/awake.svg';
import fadeIcon from 'raw-loader!../assets/fade.svg';
import githubIcon from 'raw-loader!../assets/github.svg';

@Component({
  selector: 'sa-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  mobile = window.innerWidth < 800;
  sidenavExpanded = window.innerWidth > 800;

  githubIcon = this.sanitizer.bypassSecurityTrustHtml(githubIcon);

  asleepIcon = this.sanitizer.bypassSecurityTrustHtml(asleepIcon);
  awakeIcon = this.sanitizer.bypassSecurityTrustHtml(awakeIcon);
  fadeIcon = this.sanitizer.bypassSecurityTrustHtml(fadeIcon);
  setColorScheme = ((window as any).setColorScheme = setColorScheme);
  getColorScheme = ((window as any).getColorScheme = getColorScheme);

  urlChange$ = new Subject<string>();
  links$ = merge(
    this.urlChange$,
    this.router.events.pipe(
      filter((e: Event): e is RouterEvent => e instanceof RouterEvent),
      map(e => e.url),
    ),
  ).pipe(
    startWith(this.location.path()),
    map(url => [
      {
        route: '',
        name: 'Introduction',
        active: url === '',
      },
      // {
      //   route: '/dashboards',
      //   name: 'Demo App',
      //   active: url.includes('/dashboards'),
      // },
      {
        route: '/getting-started',
        name: 'Getting Started',
        active: url.includes('/getting-started'),
      },
      {
        route: '/demos',
        name: 'Demos',
        active: url.includes('/demos'),
      },
      {
        route: '/concepts',
        name: 'Concepts',
        children: [
          ['overview', 'Overview'],
          ['sources', 'Sources'],
          ['adapters', 'Adapters'],
          ['stores', 'Stores'],
          ['thinking-reactively', 'Thinking Reactively'],
        ].map(child => this.mapToChildRoute(url, '/concepts/', child)),
      },
      {
        route: '/adapters',
        name: 'Adapters',
        children: [['core', 'Core']].map(child =>
          this.mapToChildRoute(url, '/adapters/', child),
        ),
      },
    ]),
  );
  constructor(
    private location: Location,
    private router: Router,
    private injector: Injector,
    private sanitizer: DomSanitizer,
  ) {
    const path = localStorage.getItem('path');
    if (path) {
      localStorage.removeItem('path');
      this.router.navigate([path]);
    }

    (window as any).document.addEventListener(
      'routeTo',
      (e: CustomEvent) => {
        e.preventDefault();
        router.navigateByUrl(e.detail);
      },
      false,
    );

    // https://github.com/ngstack/code-editor/issues/628
    import('./adapters/adapters-core.component').then(m =>
      this.injector
        .get(m.CodeEditorService)
        .loadEditor()
        .then(() => this.injector.get(m.EditorReadyService).ready$.next(true)),
    );
  }

  navigate(e: any) {
    setTimeout(() => this.urlChange$.next(this.location.path()));
  }

  trackByRoute(id: number, item: { route: string }) {
    return item.route;
  }

  private mapToChildRoute(
    url: string,
    baseUrl: string,
    [childUrl, childName]: string[],
  ) {
    const route = baseUrl + childUrl;
    const hashUrl = new RegExp(/#.*/);
    return {
      route,
      active: url.replace(hashUrl, '') === route,
      name: childName,
    };
  }
}
