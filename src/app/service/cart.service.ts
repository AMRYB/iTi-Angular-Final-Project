
import { Injectable } from '@angular/core';
import { Iproduct } from '../model/iproduct';

export interface CartItem {
  product: Iproduct;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private items: CartItem[] = [];
  readonly shippingFee = 30; 

  getItems(): CartItem[] {
    return this.items;
  }

  clear() {
    this.items = [];
  }

  add(product: Iproduct, qty = 1) {
    const found = this.items.find(i => i.product.id === product.id);
    if (found) {
      this.items = this.items.map(i =>
        i.product.id === product.id ? { ...i, qty: i.qty + qty } : i
      );
    } else {
      this.items = [...this.items, { product, qty }];
    }
  }

  updateQty(productId: number, qty: number) {
    this.items = this.items.map(i =>
      i.product.id === productId ? { ...i, qty: Math.max(1, qty) } : i
    );
  }

  remove(productId: number) {
    this.items = this.items.filter(i => i.product.id !== productId);
  }

  getSubTotal(): number {
    return this.items.reduce((s, i) => s + (i.product.price || 0) * i.qty, 0);
  }

  getGrandTotal(includeShipping: boolean): number {
    return this.getSubTotal() + (includeShipping && this.items.length ? this.shippingFee : 0);
  }
}
