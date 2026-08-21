import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { CartStores } from './cart';
import { CrewStores } from './crew';
import { TickerKeepAliveComponent, TickerLifecycleComponent } from './live';
import { TodosStores } from './todos';

@Component({
  standalone: true,
  selector: 'sa-root',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    TickerKeepAliveComponent,
    TickerLifecycleComponent,
  ],
  template: `
    <div class="app">
      @if (keepAlive()) {
        <sa-ticker-keep-alive />
      }

      <header class="topbar">
        <a
          class="brand"
          href="https://state-adapt.github.io/"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://state-adapt.github.io/sa3-3.svg"
            class="logo stateadapt"
            alt="StateAdapt logo"
          />
          <span class="brand-name">StateAdapt</span>
        </a>

        <nav class="nav" aria-label="Demo sections">
          <a
            routerLink="/"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            data-testid="nav-home"
          >
            Home
          </a>
          <a routerLink="/counter" routerLinkActive="active" data-testid="nav-counter">
            Counter
          </a>
          <a routerLink="/todos" routerLinkActive="active" data-testid="nav-todos">
            Todos
            @if (todos.activeCount()) {
              <span class="badge" data-testid="nav-todos-badge">{{ todos.activeCount() }}</span>
            }
          </a>
          <a routerLink="/cart" routerLinkActive="active" data-testid="nav-cart">
            Cart
            @if (cart.itemCount()) {
              <span class="badge" data-testid="nav-cart-badge">{{ cart.itemCount() }}</span>
            }
          </a>
          <a routerLink="/crew" routerLinkActive="active" data-testid="nav-crew">
            Crew
            @if (crew.selectedCount()) {
              <span class="badge" data-testid="nav-crew-badge">{{ crew.selectedCount() }}</span>
            }
          </a>
          <a routerLink="/live" routerLinkActive="active" data-testid="nav-live">
            Live
          </a>
        </nav>
      </header>

      <main class="content">
        <router-outlet />
      </main>

      <footer class="footer">
        <sa-ticker-lifecycle />
        <label class="keep-alive">
          <input
            type="checkbox"
            data-testid="keep-alive"
            [checked]="keepAlive()"
            (change)="keepAlive.set($any($event.target).checked)"
          />
          Keep ticker alive
        </label>
      </footer>
    </div>
  `,
})
export class AppComponent {
  todos = inject(TodosStores).todos;
  cart = inject(CartStores).cart;
  crew = inject(CrewStores).crew;
  keepAlive = signal(false);
}
