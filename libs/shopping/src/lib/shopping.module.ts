import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ButtonModule,
  CheckboxModule,
  NumberModule,
} from 'carbon-components-angular';

import { ShoppingComponent } from './shopping.component';
import { ProductComponent } from './product.component';
import { ProductsComponent } from './products.component';
import { FormsModule } from '@angular/forms';
import { QuantityLabelPipe } from './quantity-label.pipe';
import { CartComponent } from './cart.component';
import { ProductFiltersComponent } from './product-filters.component';

@NgModule({
  imports: [
    CommonModule,
    ButtonModule,
    CheckboxModule,
    NumberModule,
    FormsModule,
  ],
  declarations: [
    ShoppingComponent,
    ProductFiltersComponent,
    ProductsComponent,
    CartComponent,
    ProductComponent,
    QuantityLabelPipe,
  ],
  exports: [
    ShoppingComponent,
    ProductFiltersComponent,
    ProductsComponent,
    CartComponent,
  ],
})
export class ShoppingSharedModule {}
