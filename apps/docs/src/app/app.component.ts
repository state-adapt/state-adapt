import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Event, Router, RouterEvent } from '@angular/router';
import { merge, Subject } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'state-adapt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  sidenavExpanded = window.innerWidth > 800;
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
  constructor(private location: Location, private router: Router) {
    const path = localStorage.getItem('path');
    if (path) {
      localStorage.removeItem('path');
      this.router.navigate([path]);
    }
  }

  navigate(e: any) {
    setTimeout(() => this.urlChange$.next(this.location.path()));
  }

  trackByRoute(id: number, item: { route: string }) {
    return item.route;
  }

  expandSidenav() {
    this.sidenavExpanded = !this.sidenavExpanded;
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
