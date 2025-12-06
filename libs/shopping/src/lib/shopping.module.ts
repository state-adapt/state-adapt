import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartComponent } from './cart.component';
import { ProductFiltersComponent } from './product-filters.component';
import { ProductComponent } from './product.component';
import { ProductsComponent } from './products.component';
import { QuantityLabelPipe } from './quantity-label.pipe';
import { ShoppingComponent } from './shopping.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [
    ShoppingComponent,
    ProductFiltersComponent,
    ProductsComponent,
    CartComponent,
    ProductComponent,
    QuantityLabelPipe,
  ],
  exports: [ShoppingComponent, ProductFiltersComponent, ProductsComponent, CartComponent],
})
export class ShoppingSharedModule {}
