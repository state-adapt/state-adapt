export const addProduct = (id: number, times = 1) => {
  for (let i = 0; i < times; i++) cy.byTestId(`add-${id}`).click();
};

export const increase = (id: number) => cy.byTestId(`increase-${id}`).click();
export const decrease = (id: number) => cy.byTestId(`decrease-${id}`).click();
export const removeLine = (id: number) => cy.byTestId(`remove-${id}`).click();

export const getQuantity = (id: number) => cy.byTestId(`qty-${id}`);
export const getLineTotal = (id: number) => cy.byTestId(`line-total-${id}`);

export const applyCoupon = (code: string) => cy.byTestId('coupon-input').type(code);
export const clearCoupon = () => cy.byTestId('coupon-input').clear();

export const getSubtotal = () => cy.byTestId('cart-subtotal');
export const getDiscount = () => cy.byTestId('cart-discount');
export const getTotal = () => cy.byTestId('cart-total');
export const getItemCount = () => cy.byTestId('cart-count');
