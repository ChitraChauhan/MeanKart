import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';
import { Category, PaginatedResponse, Product } from '../common/constant';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = environment.apiUrl + '/api/products';

  constructor(private http: HttpClient) {}

  getProducts(
    page: number = 1,
    keyword: string = '',
    categoryId: string = '',
  ): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', '12');

    if (keyword) {
      params = params.set('keyword', keyword);
    }

    if (categoryId) {
      params = params.set('category', categoryId);
    }

    return this.http.get<PaginatedResponse<Product>>(this.apiUrl, { params });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`);
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  updateCategory(
    id: string,
    category: Partial<Category>,
  ): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getProductsByCategory(
    category: string,
  ): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams().set('category', category);

    return this.http.get<PaginatedResponse<Product>>(this.apiUrl, { params });
  }
}
