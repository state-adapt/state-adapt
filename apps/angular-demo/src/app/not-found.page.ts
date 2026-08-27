import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'sa-not-found-page',
  imports: [RouterLink],
  template: `
    <section class="panel" data-testid="not-found">
      <h1>Not found</h1>
      <p class="muted">That route doesn't exist in this demo.</p>
      <a class="button" routerLink="/">Back home</a>
    </section>
  `,
})
export class NotFoundPageComponent {}
