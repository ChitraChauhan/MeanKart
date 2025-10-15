import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../../environment';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  templateUrl: `./product-list.component.html`,
  imports: [DecimalPipe, RouterModule, ReactiveFormsModule, FormsModule],
  styleUrl: `./product-list.component.scss`,
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  ASSET_BASE_URL = environment.assetsBaseUrl || 'assets/';
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  pageSize = 8;
  searchTerm = '';
  loading = false;
  error: string | null = null;
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((term) => {
        this.performSearch(term);
      });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(page: number = 1): void {
    this.loading = true;
    this.error = null;
    this.currentPage = page;

    this.productService.getProducts(page, this.searchTerm).subscribe({
      next: (response: {
        products: Product[];
        page: number;
        pages: number;
        total: number;
      }) => {
        this.products = response.products;
        this.currentPage = response.page;
        this.totalPages = response.pages;
        this.totalItems = response.total;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading products:', err);
        this.error = 'Failed to load products. Please try again.';
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm.trim());
  }

  private performSearch(term: string): void {
    this.searchTerm = term;
    this.loadProducts(1);
  }

  onPageChange(page: number): void {
    this.loadProducts(page);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2),
    );
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  addToCart(product: any): void {
    this.authService.isAuthenticated$.subscribe(({ auth }) => {
      if (auth) {
        this.cartService.addToCart(product._id, 1).subscribe(() => {
          this.notificationService.show({
            type: 'success',
            message: `${product.name} added to cart`,
            duration: 3000,
          });
        });
        this.router.navigate(['/cart']);
      } else {
        this.router.navigate(['/login']);
        this.notificationService.show({
          type: 'success',
          message:
            'Missing Cart items?\n' +
            'Login to see the items you added previously\n',
          duration: 3000,
        });
      }
    });
  }

  viewProduct(id: string): void {
    this.router.navigate(['/products', id]);
  }
}
