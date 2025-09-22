import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { AddProductComponent } from './add-product.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { CartService } from '../../service/cart.service';
import { of, throwError } from 'rxjs';

describe('AddProductComponent', () => {
  let fixture: ComponentFixture<AddProductComponent>;
  let component: AddProductComponent;

  // Spies (Jasmine style). If using Jest, convert to jest.fn()
  let productSrvSpy: jasmine.SpyObj<ProductService>;
  let cartSpy: jasmine.SpyObj<CartService>;
  let routerSpy: { navigate: jasmine.Spy; navigateByUrl: jasmine.Spy };

  // Minimal fake for ActivatedRoute.paramMap.get()
  const routeStub = {
    snapshot: {
      paramMap: {
        get: (key: string) => '1',
      },
    },
  } as unknown as ActivatedRoute;

  const setRouteId = (value: string | null) => {
    (routeStub.snapshot.paramMap as any).get = (_: string) => value as any;
  };

  beforeEach(async () => {
    productSrvSpy = jasmine.createSpyObj<ProductService>('ProductService', ['getById']);
    cartSpy = jasmine.createSpyObj<CartService>('CartService', ['add']);
    routerSpy = {
      navigate: jasmine.createSpy('navigate'),
      navigateByUrl: jasmine.createSpy('navigateByUrl'),
    };

    await TestBed.configureTestingModule({
      imports: [AddProductComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: ProductService, useValue: productSrvSpy },
        { provide: CartService, useValue: cartSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddProductComponent);
    component = fixture.componentInstance;
  });

  it('should render static status text', () => {
    setRouteId('0'); // prevent NaN branch in this render-only test
    productSrvSpy.getById.and.returnValue(of(null));
    fixture.detectChanges(); // triggers ngOnInit
    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).toContain('Adding product to cart...');
  });

  describe('Observable (async) ProductService path', () => {
    it('should add product to cart when observable emits a product', fakeAsync(() => {
      setRouteId('42');
      const product = { id: 42, title: 'Test', price: 10 };
      productSrvSpy.getById.and.returnValue(of(product));

      fixture.detectChanges(); // ngOnInit subscribes
      // of() emits synchronously; no need to flush, but safe:
      flushMicrotasks();

      expect(productSrvSpy.getById).toHaveBeenCalledTimes(1);
      expect(productSrvSpy.getById).toHaveBeenCalledWith(42);
      expect(cartSpy.add).toHaveBeenCalledTimes(1);
      expect(cartSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ id: 42 }), 1);

      // Navigation was removed from implementation; ensure no Router calls occurred
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    }));

    it('should not add to cart if observable emits null/undefined', fakeAsync(() => {
      setRouteId('5');
      productSrvSpy.getById.and.returnValue(of(null as any));

      fixture.detectChanges();
      flushMicrotasks();

      expect(productSrvSpy.getById).toHaveBeenCalledWith(5);
      expect(cartSpy.add).not.toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    }));

    it('should handle observable error without calling cart or router', fakeAsync(() => {
      setRouteId('7');
      productSrvSpy.getById.and.returnValue(throwError(() => new Error('boom')));

      fixture.detectChanges();
      flushMicrotasks();

      expect(productSrvSpy.getById).toHaveBeenCalledWith(7);
      expect(cartSpy.add).not.toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    }));
  });

  describe('Synchronous ProductService path (non-observable return)', () => {
    it('should add product when service returns a plain object (no subscribe method)', fakeAsync(() => {
      setRouteId('3');
      const product = { id: 3, name: 'Plain' } as any;
      // getById is invoked twice in the sync branch; return same object both times
      productSrvSpy.getById.and.returnValue(product);

      fixture.detectChanges();
      // Implementation schedules Promise.resolve().then(...); flush microtasks for completeness
      flushMicrotasks();

      expect(productSrvSpy.getById).toHaveBeenCalledTimes(2);
      expect(productSrvSpy.getById).toHaveBeenCalledWith(3);
      expect(cartSpy.add).toHaveBeenCalledTimes(1);
      expect(cartSpy.add).toHaveBeenCalledWith(product, 1);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    }));

    it('should not add to cart when service returns falsy value', fakeAsync(() => {
      setRouteId('9');
      productSrvSpy.getById.and.returnValue(undefined as any);

      fixture.detectChanges();
      flushMicrotasks();

      // Called twice even in falsy case (branch behavior)
      expect(productSrvSpy.getById).toHaveBeenCalledTimes(2);
      expect(productSrvSpy.getById).toHaveBeenCalledWith(9);
      expect(cartSpy.add).not.toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    }));
  });

  describe('Invalid id path', () => {
    it('should not call ProductService or CartService when id is NaN', fakeAsync(() => {
      setRouteId('not-a-number');

      fixture.detectChanges();
      flushMicrotasks();

      expect(productSrvSpy.getById).not.toHaveBeenCalled();
      expect(cartSpy.add).not.toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    }));

    it('should handle null id gracefully', fakeAsync(() => {
      setRouteId(null);

      fixture.detectChanges();
      flushMicrotasks();

      expect(productSrvSpy.getById).not.toHaveBeenCalled();
      expect(cartSpy.add).not.toHaveBeenCalled();
    }));
  });
});