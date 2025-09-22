// ProductComponent unit tests
// Test framework note:
// - Uses Angular's TestBed and generic describe/it/expect syntax.
// - Avoids jasmine- or jest-specific spy APIs so it runs under Jasmine+Karma or Jest.
// - External deps (ProductService, CartService) are stubbed manually.

/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';

import { ProductComponent } from './product.component';
import { ProductService } from '../../service/product.service';
import { CartService } from '../../service/cart.service';

class ManualCartServiceStub {
  public calls: any[] = [];
  add = (...args: any[]) => {
    this.calls.push(args);
  };
}

const makeProducts = (): any[] => ([
  { id: 1, name: 'Chocolate Cake', categoryId: 1, price: 10 },
  { id: 2, name: 'Sourdough Bread', categoryId: 2, price: 5 },
  { id: 3, name: 'Crunchies', categoryId: 3, price: 7 },
  { id: 4, name: 'Savory Mix', categoryId: 4, price: 9 },
  { id: 5, name: 'CAKE Pop', categoryId: 1, price: 3 },
  { id: 6, /* missing name on purpose */ categoryId: 2, price: 2 },
]);

// productServiceStub returns whatever is currently in getAllResponse
let getAllResponse: any;
const productServiceStub = {
  getAll: () => getAllResponse
};

describe('ProductComponent (unit)', () => {
  let fixture: ComponentFixture<ProductComponent>;
  let component: ProductComponent;
  let cartStub: ManualCartServiceStub;

  beforeEach(async () => {
    // fresh cart stub each time
    cartStub = new ManualCartServiceStub();

    await TestBed.configureTestingModule({
      imports: [ProductComponent], // standalone component
      providers: [
        { provide: ProductService, useValue: productServiceStub },
        { provide: CartService, useValue: cartStub }
      ]
    })
      // Avoid external template/styles compilation; we test class logic here
      .overrideComponent(ProductComponent, { set: { template: '' } })
      .compileComponents();
  });

  const createWithDetectChanges = () => {
    fixture = TestBed.createComponent(ProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit
  };

  it('should create with defaults and constant metadata', () => {
    getAllResponse = []; // no products
    createWithDetectChanges();

    expect(component).toBeTruthy();
    expect(component.searchText).toBe('');
    expect(component.selectedCategory).toBeNull();
    expect(Array.isArray(component.categories)).toBeTrue();
    expect(component.categories.map(c => c.name)).toEqual(['Cakes', 'Breads', 'Crunchies', 'Savories']);
    expect(component.bannerImage).toBe('assets/berry tart angular.jpeg');
  });

  it('ngOnInit should handle Observable response from ProductService', () => {
    const products = makeProducts();
    getAllResponse = of(products);
    createWithDetectChanges();

    expect(component.products.length).toBe(products.length);
    expect(component.filteredProducts.length).toBe(products.length);
  });

  it('ngOnInit should handle synchronous array response from ProductService', () => {
    const products = makeProducts();
    getAllResponse = products; // sync path
    createWithDetectChanges();

    expect(component.products.length).toBe(products.length);
    expect(component.filteredProducts.length).toBe(products.length);
  });

  it('applyFilters: returns all when no filters set', () => {
    getAllResponse = [];
    createWithDetectChanges();
    component.products = makeProducts();
    component.searchText = '';
    component.selectedCategory = null;

    component.applyFilters();
    expect(component.filteredProducts.length).toBe(component.products.length);
  });

  it('applyFilters: filters by searchText (case-insensitive)', () => {
    getAllResponse = [];
    createWithDetectChanges();
    component.products = makeProducts();
    component.searchText = 'cake';
    component.selectedCategory = null;

    component.applyFilters();
    const names = component.filteredProducts.map((p: any) => p.name);
    expect(names).toContain('Chocolate Cake');
    expect(names).toContain('CAKE Pop');
    // Ensure non-matching item excluded
    expect(names).not.toContain('Sourdough Bread');
  });

  it('applyFilters: filters by selectedCategory only', () => {
    getAllResponse = [];
    createWithDetectChanges();
    component.products = makeProducts();
    component.searchText = '';
    component.selectedCategory = 2;

    component.applyFilters();
    expect(component.filteredProducts.length).toBeGreaterThan(0);
    expect(component.filteredProducts.every((p: any) => p.categoryId === 2)).toBeTrue();
  });

  it('applyFilters: filters by searchText and category together', () => {
    getAllResponse = [];
    createWithDetectChanges();
    component.products = makeProducts();
    component.searchText = 'bread';
    component.selectedCategory = 1; // mismatch on purpose

    component.applyFilters();
    expect(component.filteredProducts.length).toBe(0);

    // matching both
    component.searchText = 'cake';
    component.selectedCategory = 1;
    component.applyFilters();
    const names = component.filteredProducts.map((p: any) => p.name);
    expect(names.sort()).toEqual(['CAKE Pop', 'Chocolate Cake'].sort());
  });

  it('applyFilters: tolerates null/undefined products array', () => {
    getAllResponse = [];
    createWithDetectChanges();
    (component as any).products = null;
    component.searchText = 'anything';
    component.selectedCategory = 1;

    expect(() => component.applyFilters()).not.toThrow();
    expect(component.filteredProducts).toEqual([]);
  });

  it('onSearchChange: updates searchText and reapplies filters', () => {
    getAllResponse = [];
    createWithDetectChanges();
    component.products = makeProducts();
    const event = { target: { value: 'bread' } } as unknown as Event;

    component.onSearchChange(event);
    expect(component.searchText).toBe('bread');
    const names = component.filteredProducts.map((p: any) => p.name);
    expect(names).toEqual(['Sourdough Bread']);
  });

  it('filterByCategory: sets category and reapplies', () => {
    getAllResponse = [];
    createWithDetectChanges();
    component.products = makeProducts();

    component.filterByCategory(4);
    expect(component.selectedCategory).toBe(4);
    expect(component.filteredProducts.every((p: any) => p.categoryId === 4)).toBeTrue();
  });

  it('clearFilters: resets state and shows all items', () => {
    getAllResponse = [];
    createWithDetectChanges();
    component.products = makeProducts();
    component.searchText = 'cake';
    component.selectedCategory = 1;

    component.clearFilters();
    expect(component.searchText).toBe('');
    expect(component.selectedCategory).toBeNull();
    expect(component.filteredProducts.length).toBe(component.products.length);
  });

  it('addToCart: adds valid product with quantity 1', () => {
    const products = makeProducts();
    getAllResponse = products;
    createWithDetectChanges();

    component.addToCart(products[0]);
    expect(cartStub.calls.length).toBe(1);
    expect(cartStub.calls[0]).toEqual([products[0], 1]);
  });

  it('addToCart: ignores falsy product', () => {
    getAllResponse = makeProducts();
    createWithDetectChanges();

    component.addToCart(null as any);
    component.addToCart(undefined as any);
    expect(cartStub.calls.length).toBe(0);
  });
});