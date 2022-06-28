import { Component } from '@angular/core';

@Component({
  selector: 'state-adapt-content',
  standalone: true,
  template: `
    <div><ng-content></ng-content></div>
  `,
  styles: [
    `
      div {
        max-width: 800px;
        width: 100%;
        margin: auto;
        padding: 12px;
      }
    `,
  ],
})
export class ContentComponent {}
