import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartService } from '../../service/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  private fb = inject(FormBuilder);
  cart = inject(CartService);

  includeShipping = signal(false);

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
    email: ['', [Validators.required, Validators.email]],
    notes: ['']
  });

  subTotal = computed(() => this.cart.getSubTotal());
  grandTotal = computed(() => this.cart.getGrandTotal(this.includeShipping()));

  onQtyChange(id: number, v: string) {
    const qty = Number(v);
    if (!isNaN(qty)) this.cart.updateQty(id, qty);
  }

  onRemove(id: number) {
    this.cart.remove(id);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.includeShipping.set(false);
      return;
    }
    this.includeShipping.set(true);
    alert('Your order has been placed');
  }


  onQtyChangeEvt(id: number, e: Event) {
    const target = e.target as HTMLInputElement | null;
    const val = target ? Number(target.value) : NaN;
    if (!isNaN(val)) this.cart.updateQty(id, val);
  }
}
