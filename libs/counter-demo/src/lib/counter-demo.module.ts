import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'carbon-components-angular';
import { CounterComponent } from './counter.component';

@NgModule({
  imports: [CommonModule, ButtonModule],
  declarations: [CounterComponent],
  exports: [CounterComponent],
})
export class CounterDemoModule {}
