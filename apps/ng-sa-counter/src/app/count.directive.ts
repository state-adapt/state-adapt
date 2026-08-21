import { Directive, ElementRef, inject, OnInit, Renderer2 } from '@angular/core';
import { adapt } from '@state-adapt/angular';

@Directive({ standalone: true, selector: '[saCountDirective]' })
export class SaCountDirective implements OnInit {
  renderer = inject(Renderer2);
  el = inject(ElementRef);

  store9 = adapt(0);

  constructor() {
    this.store9.set(9); // Errors if not immediately activated
  }

  ngOnInit() {
    this.renderer.setStyle(
      this.el.nativeElement,
      'color',
      this.store9() === 9 ? 'darkturquoise' : 'red',
    );
  }
}
