import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../service/product.service';
import { CartService } from '../../service/cart.service';
import { Iproduct } from '../../model/iproduct';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  searchText: string = '';
  selectedCategory: number | null = null;
  categories: { id: number, name: string }[] = [
    { id: 1, name: 'Cakes' },
    { id: 2, name: 'Breads' },
    { id: 3, name: 'Crunchies' },
    { id: 4, name: 'Savories' }
  ];

  products: Iproduct[] = [];
  filteredProducts: Iproduct[] = [];

  bannerImage: string = 'assets/berry tart angular.jpeg';

  constructor(private cart: CartService, private productService: ProductService) {}

  ngOnInit(): void {
    const res: any = this.productService.getAll();
    if (res && typeof res.subscribe === 'function') {
      // HttpClient Observable
      res.subscribe((data: Iproduct[]) => {
        this.products = data || [];
        this.filteredProducts = [...this.products];
      });
    } else {
      // Sync array
      this.products = res || [];
      this.filteredProducts = [...this.products];
    }
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchText = input.value;
    this.applyFilters();
  }

  filterByCategory(categoryId: number | null): void {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCategory = null;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredProducts = (this.products || []).filter((p: any) =>
      (this.searchText ? (p.name || '').toLowerCase().includes(this.searchText.toLowerCase()) : true) &&
      (this.selectedCategory === null || p.categoryId === this.selectedCategory)
    );
  }

  addToCart(p: Iproduct) {
    if (p) {
      this.cart.add(p, 1);
      // TODO: show a toast if needed
    }
  }
}
