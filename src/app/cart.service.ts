import { Injectable } from '@angular/core';
import { Product } from './models/Product';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private baseUrl = 'http://localhost:3000/api';
  private cart: Product[] = [];
  private cartSubject: BehaviorSubject<Product[]> = new BehaviorSubject<Product[]>([]);

  constructor(private http: HttpClient, private userService: UserService) {
    this.http.get<Product[]>(`${this.baseUrl}/cart`).subscribe(cart => {
      this.cart = cart;
      this.cartSubject.next(this.cart);
    });
  }

  getCart(): Product[] {
    return this.cart;
  }

  getCartObservable() {
    return this.cartSubject.asObservable();
  }
  private apiUrl = 'http://localhost:3000/api';
  
  addToCart(userId: string, product: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cart/${userId}/add`, product);
  }
  
  /*addToCart(product: Product) {
    this.cart.push(product);
    this.cartSubject.next(this.cart);
    this.http.post(`${this.baseUrl}/cart`, this.cart).subscribe(() => {
      console.log("product :" + product.title +" added to cart")
    });
  }
*/
removeFromCart(userId: string, productId: string): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/cart/${userId}/remove/${productId}`);
}

updateSelectedQuantity(userId: string, productId: string, selectedQuantity: number): Observable<any> {
  return this.http.put(`${this.apiUrl}/cart/${userId}/update/${productId}`, { selectedQuantity });
}


}
