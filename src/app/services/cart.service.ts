// cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface CartItem {
  _id?: string;
  product: string | { _id: string; name: string; price: number; imageUrl: string[] };
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Cart {
  _id?: string;
  user: string;
  items: CartItem[];
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
  Quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:5000/api/cart';

  private cartSubject: BehaviorSubject<Cart | null>;
  cart$: Observable<Cart | null>;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.cartSubject = new BehaviorSubject<Cart | null>(null);
    this.cart$ = this.cartSubject.asObservable();
    this.loadCart();
  }

  private loadCart(): void {
    this.authService.isAuthenticated$.subscribe(({auth}) => {
      if (auth) {
        this.fetchCart().subscribe();
      } else {
        this.cartSubject.next(null);
      }
    });
  }

  public fetchCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  addToCart(productId: string, quantity: number = 1): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/items`, { productId, quantity }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  updateItemQuantity(itemId: string, quantity: number): Observable<Cart> {
    if (quantity < 1) {
      return this.removeItem(itemId);
    }
    return this.http.put<Cart>(`${this.apiUrl}/items/${itemId}`, { quantity }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  removeItem(itemId: string): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${itemId}`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  clearCart(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(this.apiUrl).pipe(
      tap(() => this.cartSubject.next(null))
    );
  }

  getCart(): Observable<Cart | null> {
    return this.cart$;
  }
}
