/*
import { Injectable } from '@angular/core';
import { Iproduct } from '../model/iproduct';
import { productList } from '../model/productList';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Iproduct[] = [];

  constructor() {
    this.products = productList; 
  }

  getAll(): Iproduct[] {
    return this.products;
  }

  getById(id: number): Iproduct | undefined {
    return this.products.find(p => p.id === id);
  }

  deleteProduct(id: number): void {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
    }
  }

  addproduct(p: Iproduct) {
    p.id = this.products.length + 1;
    this.products.push(p);
  }

  updateProduct(updatedProduct: Iproduct): void {
    const index = this.products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      this.products[index] = updatedProduct;
    }
  }
}*/

// src/app/services/product.service.ts



import { Injectable } from '@angular/core';
import { Iproduct } from '../model/iproduct';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/product'; 

  constructor(private http: HttpClient) {}

  getAll(): Observable<Iproduct[]> {
    return this.http.get<Iproduct[]>(this.apiUrl);
  }

  getById(id: number): Observable<Iproduct> {
    return this.http.get<Iproduct>(`${this.apiUrl}/${id}`);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addProduct(p: Iproduct): Observable<Iproduct> {
    return this.http.post<Iproduct>(this.apiUrl, p);
  }

  updateProduct(p: Iproduct): Observable<Iproduct> {
    return this.http.put<Iproduct>(`${this.apiUrl}/${p.id}`, p);
  }

  getCategories(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:3000/categories');
}
}
