import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) { }

  // User Management
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, userData);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }

  // ProductModel Management
  createProduct(productData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/products`, productData);
  }

  updateProduct(productId: string, productData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/products/${productId}`, productData);
  }

  deleteProduct(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${productId}`);
  }
}
