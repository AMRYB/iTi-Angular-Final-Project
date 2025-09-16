/*import { Injectable } from '@angular/core';
import { Iproduct } from '../model/iproduct';
import { productList } from '../model/productList';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  [x: string]: any;
  product:Iproduct[]=[]

  constructor() { 
    this.product=productList
  }
  getAll(){
    return this.product
  }
  delete(id:number){
    this.product=this.product. filter(ele=>ele.id!=id)
  }
  addProduct(p:Iproduct){
    p.id=this.product.length+1
    this.product.push(p)
  }
  getById(id:number){
    return this.product.find(ele=>ele.id==id)
  }
}*/

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
}
