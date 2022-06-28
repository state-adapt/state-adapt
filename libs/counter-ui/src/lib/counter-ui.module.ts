import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'carbon-components-angular/button';
import { CounterComponent } from './counter.component';
import { ResetBothComponent } from './reset-both.component';

@NgModule({
  imports: [CommonModule, ButtonModule],
  declarations: [CounterComponent, ResetBothComponent],
  exports: [CounterComponent, ResetBothComponent],
})
export class CounterUiModule {}
