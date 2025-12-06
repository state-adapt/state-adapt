import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CounterComponent } from './counter.component';
import { ResetBothComponent } from './reset-both.component';

@NgModule({
  imports: [CommonModule],
  declarations: [CounterComponent, ResetBothComponent],
  exports: [CounterComponent, ResetBothComponent],
})
export class CounterUiModule {}
