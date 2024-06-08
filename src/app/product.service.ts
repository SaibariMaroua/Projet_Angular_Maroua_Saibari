import { Injectable } from '@angular/core';
import { Product } from './models/Product';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private http: HttpClient) { }
  private baseUrl = 'http://localhost:3000/api';
  private products: Product[] = [];

 getProductsList(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }
 
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  toggleDescription(product: Product): void {
    product.showDescription = !product.showDescription;
  }

  getAvailableProducts(): Product[] {
    return this.products.filter(product => product.quantity > 0);
  }

  isLowStock(quantity: number): boolean {
    return quantity > 0 && quantity < 5;
  }
 
  deleteProduct(id: string): Observable<any> {
    console.log('Deleting product with ID:', id);
    return this.http.delete<any>(`${this.baseUrl}/products/${id}`).pipe(
      tap(() => console.log('Product deleted successfully')),
      catchError((error) => {
        console.error('Error deleting product:', error);
        return throwError(error);
      })
    );
  }
  
  

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred while deleting the product.';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `An error occurred: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server returned error code ${error.status}: ${error.error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }


  updateProduct(product: Product): Observable<any> {
    const url = `${this.baseUrl}/products/${product._id}`;
    return this.http.put<any>(url, product).pipe(
      tap(() => console.log('Product updated successfully')),
      catchError((error) => {
        console.error('Error updating product:', error);
        return throwError(error);
      })
    );
  }

  getProductsListt(page: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}?page=${page}`);
  }
  
 /* searchProducts(searchTerm: string): Product[] {
    // Filtrer les produits en fonction du terme de recherche
    return this.products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }*/

  private selectedProductSubject = new BehaviorSubject<Product | null>(null);
  selectedProduct$ = this.selectedProductSubject.asObservable();

  setSelectedProduct(product: Product | null) {
    this.selectedProductSubject.next(product);
  }

  private apiUrl = 'http://localhost:3000/api/products';
  getProductById(productId: string): Observable<any> {
    const url = `${this.apiUrl}/${productId}`;
    return this.http.get<any>(url);
  }

  uploadImage(imageData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/uploadImage`, imageData);
  }
  
}
