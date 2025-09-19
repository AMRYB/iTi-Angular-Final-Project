import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../service/product.service';
import { CartService } from '../../service/cart.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-5 text-center">
      <h5>Adding product to cart...</h5>
    </div>
  `,
})
export class AddProductComponent {
  private route = inject(ActivatedRoute);
  private productSrv = inject(ProductService);
  private cart = inject(CartService);
  private router = inject(Router);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!isNaN(id)) {
      const obs: any = this.productSrv.getById(id);
      if (obs && typeof obs.subscribe === 'function') {
        // HttpClient case
        obs.subscribe({
          next: (p: any) => { if (p) this.cart.add(p, 1); },
          complete: () => this.router/* navigation removed */,
          error: () => this.router/* navigation removed */,
        });
      } else {
        // sync service case
        const p = this.productSrv.getById(id);
        if (p) this.cart.add(p as any, 1);
        Promise.resolve().then(() => this.router/* navigation removed */);
      }
    } else {
      this.router/* navigation removed */
    }
  }
}
