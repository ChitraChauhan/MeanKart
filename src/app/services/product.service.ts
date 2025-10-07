import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductModel } from '../models/product.model';

export interface PaginatedResponse<T> {
  products: T[];
  page: number;
  pages: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:5000/api/products';

  constructor(private http: HttpClient) { }

  getProducts(page: number = 1, keyword: string = ''): Observable<PaginatedResponse<ProductModel>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', '8'); // 12 items per page

    if (keyword) {
      params = params.set('keyword', keyword);
    }

    return this.http.get<PaginatedResponse<ProductModel>>(this.apiUrl, { params });
  }

  getProductById(id: string): Observable<ProductModel> {
    return this.http.get<ProductModel>(`${this.apiUrl}/${id}`);
  }
}
