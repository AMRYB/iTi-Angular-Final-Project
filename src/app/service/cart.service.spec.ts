import { TestBed } from '@angular/core/testing';
import { CartService, CartItem } from './cart.service';
import { Iproduct } from '../model/iproduct';

describe('CartService', () => {
  let service: CartService;

  const productA = (overrides: Partial<Iproduct> = {}): Iproduct => ({
    id: 1,
    name: 'Product A',
    price: 100,
    ...overrides,
  } as Iproduct);

  const productB = (overrides: Partial<Iproduct> = {}): Iproduct => ({
    id: 2,
    name: 'Product B',
    price: 50,
    ...overrides,
  } as Iproduct);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartService],
    });
    service = TestBed.inject(CartService);
    service.clear();
  });

  describe('initial state', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should start with empty items', () => {
      expect(service.getItems()).toEqual([]);
      expect(service.getSubTotal()).toBe(0);
      expect(service.getGrandTotal(true)).toBe(0, 'no shipping when empty cart');
      expect(service.getGrandTotal(false)).toBe(0);
    });

    it('should expose a shippingFee constant of 30', () => {
      expect(service.shippingFee).toBe(30);
    });
  });

  describe('add()', () => {
    it('adds a new product with default qty=1', () => {
      service.add(productA());
      const items = service.getItems();

      expect(items.length).toBe(1);
      expect(items[0]).toEqual(jasmine.objectContaining<Partial<CartItem>>({
        product: jasmine.objectContaining({ id: 1 }),
        qty: 1,
      }));
    });

    it('adds a new product with explicit qty', () => {
      service.add(productA(), 3);
      const [item] = service.getItems();
      expect(item.qty).toBe(3);
    });

    it('increments qty when adding the same product again', () => {
      service.add(productA(), 2);
      service.add(productA(), 3);
      const [item] = service.getItems();
      expect(item.qty).toBe(5);
    });

    it('adds multiple distinct products', () => {
      service.add(productA(), 1);
      service.add(productB(), 2);
      const items = service.getItems();
      expect(items.map(i => i.product.id).sort()).toEqual([1, 2]);
      const itemB = items.find(i => i.product.id === 2);
      expect(itemB).toBeDefined();
      expect(itemB?.qty).toBe(2);
    });

    it('handles adding with qty=0 (edge case)', () => {
      service.add(productA(), 0);
      const [item] = service.getItems();
      expect(item.qty).toBe(0);
      expect(service.getSubTotal()).toBe(0);
    });

    it('handles adding with negative qty (edge case: allowed by current implementation)', () => {
      service.add(productA(), -2);
      const [item] = service.getItems();
      expect(item.qty).toBe(-2);
      // Subtotal becomes negative accordingly
      expect(service.getSubTotal()).toBe(-200);
    });
  });

  describe('updateQty()', () => {
    it('updates quantity for existing product', () => {
      service.add(productA(), 2);
      service.updateQty(1, 5);
      const [item] = service.getItems();
      expect(item.qty).toBe(5);
    });

    it('clamps quantity to minimum of 1 when given 0', () => {
      service.add(productA(), 2);
      service.updateQty(1, 0);
      const [item] = service.getItems();
      expect(item.qty).toBe(1);
    });

    it('clamps quantity to minimum of 1 when given negative number', () => {
      service.add(productA(), 4);
      service.updateQty(1, -10);
      const [item] = service.getItems();
      expect(item.qty).toBe(1);
    });

    it('does nothing if product id does not exist', () => {
      service.add(productA(), 2);
      service.updateQty(999, 10);
      const [item] = service.getItems();
      expect(item.qty).toBe(2);
    });

    it('updates only the targeted product when multiple exist', () => {
      service.add(productA(), 1);
      service.add(productB(), 2);
      service.updateQty(2, 7);
      const items = service.getItems();
      const item1 = items.find(i => i.product.id === 1);
      const item2 = items.find(i => i.product.id === 2);
      expect(item1).toBeDefined();
      expect(item1?.qty).toBe(1);
      expect(item2).toBeDefined();
      expect(item2?.qty).toBe(7);
    });
  });

  describe('remove()', () => {
    it('removes the specified product', () => {
      service.add(productA(), 1);
      service.add(productB(), 2);
      service.remove(1);
      const items = service.getItems();
      expect(items.length).toBe(1);
      expect(items[0].product.id).toBe(2);
    });

    it('is a no-op if product does not exist', () => {
      service.add(productA(), 1);
      service.remove(999);
      expect(service.getItems().length).toBe(1);
    });

    it('can remove the last item resulting in empty cart', () => {
      service.add(productA(), 1);
      service.remove(1);
      expect(service.getItems()).toEqual([]);
      expect(service.getSubTotal()).toBe(0);
    });
  });

  describe('clear()', () => {
    it('empties the cart completely', () => {
      service.add(productA(), 1);
      service.add(productB(), 2);
      service.clear();
      expect(service.getItems()).toEqual([]);
    });
  });

  describe('getSubTotal()', () => {
    it('calculates subtotal as sum of price * qty', () => {
      service.add(productA({ price: 100 }), 2); // 200
      service.add(productB({ price: 50 }), 3);  // 150
      expect(service.getSubTotal()).toBe(350);
    });

    it('treats missing price as 0 (edge case)', () => {
      service.add(productA({ price: undefined as unknown as number }), 5);
      expect(service.getSubTotal()).toBe(0);
    });

    it('supports zero price products', () => {
      service.add(productA({ price: 0 }), 4);
      expect(service.getSubTotal()).toBe(0);
    });

    it('reflects negative quantities if present (edge case per implementation)', () => {
      service.add(productA({ price: 100 }), -1);
      expect(service.getSubTotal()).toBe(-100);
    });
  });

  describe('getGrandTotal()', () => {
    it('returns 0 when cart empty, regardless of includeShipping', () => {
      expect(service.getGrandTotal(true)).toBe(0);
      expect(service.getGrandTotal(false)).toBe(0);
    });

    it('equals subtotal when includeShipping=false', () => {
      service.add(productA({ price: 100 }), 2); // subtotal 200
      expect(service.getGrandTotal(false)).toBe(200);
    });

    it('adds shipping fee when includeShipping=true and cart has items', () => {
      service.add(productA({ price: 100 }), 2); // subtotal 200
      expect(service.getGrandTotal(true)).toBe(200 + service.shippingFee);
    });

    it('does not add shipping if subtotal negative (still has items, but logic adds fee) - documents current behavior', () => {
      service.add(productA({ price: 100 }), -1); // subtotal -100, items length = 1
      expect(service.getGrandTotal(true)).toBe(-100 + service.shippingFee);
    });
  });
});