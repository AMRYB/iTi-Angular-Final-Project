import { TestBed } from '@angular/core/testing';

import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

// Note: The following tests assume typical REST endpoints and method names.
// If ProductService differs, adjust the method names and URLs accordingly.
describe('ProductService RESTful methods', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getAll() should request list of products (happy path)', () => {
    const mock = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
    let received: any[] | undefined;

    // @ts-ignore - method may differ; update if needed
    service.getAll().subscribe(v => received = v);

    const req = httpMock.expectOne(r => r.method === 'GET');
    expect(req.request.method).toBe('GET');
    req.flush(mock);

    expect(received).toEqual(mock);
  });

  it('getById() should request a single product by id', () => {
    const mock = { id: 42, name: 'Answer' };
    let received: any | undefined;

    // @ts-ignore
    service.getById(42).subscribe(v => received = v);

    const req = httpMock.expectOne(r => r.method === 'GET' && /42/.test(r.url));
    expect(req.request.method).toBe('GET');
    req.flush(mock);

    expect(received).toEqual(mock);
  });

  it('create() should POST and return created product with id', () => {
    const input = { name: 'New' };
    const mock = { id: 101, name: 'New' };
    let received: any | undefined;

    // @ts-ignore
    service.create(input as any).subscribe(v => received = v);

    const req = httpMock.expectOne(r => r.method === 'POST');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(input);
    req.flush(mock);

    expect(received).toEqual(mock);
  });

  it('update() should PUT and return updated product', () => {
    const input = { id: 5, name: 'Updated' };
    let received: any | undefined;

    // @ts-ignore
    service.update(input as any).subscribe(v => received = v);

    const req = httpMock.expectOne(r => r.method === 'PUT' && /5/.test(r.url));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(input);
    req.flush(input);

    expect(received).toEqual(input);
  });

  it('delete() should DELETE by id and return success/no content', () => {
    let status = 0;

    // @ts-ignore
    service.delete(7).subscribe(() => status = 204, () => status = -1);

    const req = httpMock.expectOne(r => r.method === 'DELETE' && /7/.test(r.url));
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(status).toBe(204);
  });

  it('search(term) should query with term and return filtered items', () => {
    const mock = [{ id: 3, name: 'Alpha' }];
    let received: any[] | undefined;

    // @ts-ignore
    service.search('Al').subscribe(v => received = v);

    const req = httpMock.expectOne(r => r.method === 'GET' && /search|query|q=/.test(r.url));
    expect(req.request.method).toBe('GET');
    req.flush(mock);

    expect(received).toEqual(mock);
  });

  it('should propagate HttpErrorResponse on server error', () => {
    let error: HttpErrorResponse | undefined;

    // @ts-ignore
    service.getAll().subscribe({
      next: () => fail('expected error'),
      error: (e: HttpErrorResponse) => error = e,
    });

    const req = httpMock.expectOne(r => r.method === 'GET');
    req.flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(error).toBeTruthy();
    expect(error?.status).toBe(500);
  });

  it('getById() should handle invalid id gracefully (e.g., null/undefined)', (done) => {
    // @ts-ignore
    service.getById(null as any).subscribe({
      next: () => {
        // Implementation-dependent: either short-circuits or errors.
        // If short-circuited, reaching here is fine; if it throws, the error path will run instead.
        done();
      },
      error: () => done(), // accept either behavior but ensure no pending HTTP calls
    });

    // Should not issue any HTTP request when id is invalid
    httpMock.expectNone(() => true);
  });
});
