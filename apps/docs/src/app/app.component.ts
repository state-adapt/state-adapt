import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'state-adapt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  sidenavExpanded = window.innerWidth > 800;
  urlChange$ = new Subject<string>();
  links$ = this.urlChange$.pipe(
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
      // {
      //   route: '/documentation',
      //   name: 'Documentation',
      //   active: url.includes('/documentation'),
      // },
      {
        route: '/demos',
        name: 'Demos',
        active: url.includes('/demos'),
      },
      {
        route: '/adapters',
        name: 'Adapters',
        children: [
          ['core', 'Core'],
          ['angular-router', 'Angular Router'],
          ['material', 'Material'],
        ].map(([adapterUrl, name]) => {
          const route = '/adapters/' + adapterUrl;
          return { route, active: url === route, name };
        }),
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
}
