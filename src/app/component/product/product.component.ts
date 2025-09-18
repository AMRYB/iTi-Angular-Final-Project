
/*
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../service/product.service';
import { Iproduct } from '../../model/iproduct';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';   

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], 
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  searchText: string = '';
  selectedCategory: string = '';
  categories: string[] = [ 'Sweet', 'Salt'];
  products: Iproduct[] = [];
  filteredProducts: Iproduct[] = [];

  // 
  bannerImage: string = 'assets/berry tart angular.jpeg';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.products = this.productService.getAll();
    this.filteredProducts = [...this.products];
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchText = input.value;
    this.applyFilters();
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(p =>
      p.name.toLowerCase().includes(this.searchText.toLowerCase()) &&
      (this.selectedCategory === '' || p.category === this.selectedCategory)
    );
  }
}*/

import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../service/product.service';
import { Iproduct } from '../../model/iproduct';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';   

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

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getAll().subscribe(data => {
      this.products = data;
      this.filteredProducts = [...this.products];
    });
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

  applyFilters(): void {
    this.filteredProducts = this.products.filter(p =>
      p.name.toLowerCase().includes(this.searchText.toLowerCase()) &&
      (this.selectedCategory === null || p.categoryId === this.selectedCategory)
    );
  }
}

