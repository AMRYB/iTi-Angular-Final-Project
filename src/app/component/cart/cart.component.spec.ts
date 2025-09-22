import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentRef } from '@angular/core';
import { CartComponent } from './cart.component';
import { CartService } from '../../service/cart.service';

class MockCartService {
  getSubTotal = jasmine.createSpy('getSubTotal').and.returnValue(123);
  getGrandTotal = jasmine.createSpy('getGrandTotal').and.callFake((includeShipping: boolean) => includeShipping ? 133 : 123);
  updateQty = jasmine.createSpy('updateQty');
  remove = jasmine.createSpy('remove');
}

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentRef<CartComponent>;
  let cart: MockCartService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CartComponent, ReactiveFormsModule],
      providers: [{ provide: CartService, useClass: MockCartService }]
    });

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.instance;
    cart = TestBed.inject(CartService) as unknown as MockCartService;
    fixture.changeDetectorRef.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.includeShipping).toBeFalse();
  });

  describe('form validation', () => {
    it('should initialize form with required controls', () => {
      const controls = component.form.controls;
      expect(controls['firstName']).toBeDefined();
      expect(controls['lastName']).toBeDefined();
      expect(controls['address']).toBeDefined();
      expect(controls['phone']).toBeDefined();
      expect(controls['email']).toBeDefined();
      expect(controls['notes']).toBeDefined();
    });

    it('should be invalid initially', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('should validate firstName and lastName min length', () => {
      component.form.patchValue({ firstName: 'A', lastName: 'B' });
      expect(component.form.get('firstName')?.valid).toBeFalse();
      expect(component.form.get('lastName')?.valid).toBeFalse();
      component.form.patchValue({ firstName: 'Al', lastName: 'Bo' });
      expect(component.form.get('firstName')?.valid).toBeTrue();
      expect(component.form.get('lastName')?.valid).toBeTrue();
    });

    it('should validate address min length', () => {
      component.form.patchValue({ address: '1234' });
      expect(component.form.get('address')?.valid).toBeFalse();
      component.form.patchValue({ address: '12345' });
      expect(component.form.get('address')?.valid).toBeTrue();
    });

    it('should validate phone number pattern (8-15 digits)', () => {
      component.form.patchValue({ phone: 'abcdef' });
      expect(component.form.get('phone')?.valid).toBeFalse();
      component.form.patchValue({ phone: '1234567' }); // 7 digits -> invalid
      expect(component.form.get('phone')?.valid).toBeFalse();
      component.form.patchValue({ phone: '12345678' }); // 8 digits -> valid
      expect(component.form.get('phone')?.valid).toBeTrue();
      component.form.patchValue({ phone: '123456789012345' }); // 15 digits -> valid
      expect(component.form.get('phone')?.valid).toBeTrue();
      component.form.patchValue({ phone: '1234567890123456' }); // 16 digits -> invalid
      expect(component.form.get('phone')?.valid).toBeFalse();
    });

    it('should validate email', () => {
      component.form.patchValue({ email: 'not-an-email' });
      expect(component.form.get('email')?.valid).toBeFalse();
      component.form.patchValue({ email: 'john@doe.com' });
      expect(component.form.get('email')?.valid).toBeTrue();
    });
  });

  describe('computed totals', () => {
    it('subTotal should delegate to cart.getSubTotal', () => {
      const val = component.subTotal;
      expect(val).toBe(123);
      expect(cart.getSubTotal).toHaveBeenCalled();
    });

    it('grandTotal should call cart.getGrandTotal with includeShipping=false by default', () => {
      const val = component.grandTotal;
      expect(val).toBe(123);
      expect(cart.getGrandTotal).toHaveBeenCalledWith(false);
    });

    it('grandTotal should call cart.getGrandTotal with includeShipping=true when enabled', () => {
      component['includeShipping'] = true; // directly set to simulate post-submit state
      const val = component.grandTotal;
      expect(val).toBe(133);
      expect(cart.getGrandTotal).toHaveBeenCalledWith(true);
    });
  });

  describe('quantity changes', () => {
    it('onQtyChange should call updateQty when numeric', () => {
      component.onQtyChange(7, '3');
      expect(cart.updateQty).toHaveBeenCalledWith(7, 3);
    });

    it('onQtyChange should ignore NaN and not call updateQty', () => {
      cart.updateQty.calls.reset();
      component.onQtyChange(7, 'abc');
      expect(cart.updateQty).not.toHaveBeenCalled();
    });

    it('onQtyChangeEvt should update when event target has numeric value', () => {
      cart.updateQty.calls.reset();
      const input = document.createElement('input');
      input.value = '9';
      const evt = new Event('change');
      Object.defineProperty(evt, 'target', { value: input, writable: false });
      component.onQtyChangeEvt(5, evt);
      expect(cart.updateQty).toHaveBeenCalledWith(5, 9);
    });

    it('onQtyChangeEvt should not update when event target is null', () => {
      cart.updateQty.calls.reset();
      const evt = new Event('change');
      Object.defineProperty(evt, 'target', { value: null, writable: false });
      component.onQtyChangeEvt(5, evt);
      expect(cart.updateQty).not.toHaveBeenCalled();
    });

    it('onQtyChangeEvt should not update when value is NaN', () => {
      cart.updateQty.calls.reset();
      const input = document.createElement('input');
      input.value = 'x';
      const evt = new Event('change');
      Object.defineProperty(evt, 'target', { value: input, writable: false });
      component.onQtyChangeEvt(5, evt);
      expect(cart.updateQty).not.toHaveBeenCalled();
    });
  });

  describe('removal', () => {
    it('onRemove should delegate to cart.remove', () => {
      component.onRemove(42);
      expect(cart.remove).toHaveBeenCalledWith(42);
    });
  });

  describe('submission flow', () => {
    const fillValidForm = () => {
      component.form.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        address: '12345 Main',
        phone: '12345678',
        email: 'john@doe.com',
        notes: 'Leave at door'
      });
    };

    it('onSubmit should markAllAsTouched and not include shipping when form is invalid', () => {
      spyOn(component.form, 'markAllAsTouched').and.callThrough();
      component.includeShipping = true; // pre-set to ensure it gets reset
      component.onSubmit();
      expect(component.form.markAllAsTouched).toHaveBeenCalled();
      expect(component.includeShipping).toBeFalse();
    });

    it('onSubmit should set includeShipping=true and alert on valid form', () => {
      fillValidForm();
      const alertSpy = spyOn(window, 'alert');
      component.onSubmit();
      expect(component.includeShipping).toBeTrue();
      expect(alertSpy).toHaveBeenCalledWith('Your order has been placed');
    });
  });
});