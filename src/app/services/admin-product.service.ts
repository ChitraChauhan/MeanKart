import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';
import { Product } from '../models/admin-product.model';

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {
  private apiUrl = `${environment.apiUrl}/api/admin/products`;

  constructor(private http: HttpClient) {}

  getProducts(page: number = 1, keyword: string = ''): Observable<any> {
    const params: any = { page: page.toString() };
    if (keyword) {
      params.keyword = keyword;
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
