import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { DecimalPipe, NgForOf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, take } from 'rxjs/operators';
import { ImageService } from '../../services/image.service';
import { Category, Product, ProductItemsPerPage } from '../../common/constant';

@Component({
  selector: 'app-product-list',
  templateUrl: `./product-list.component.html`,
  imports: [DecimalPipe, RouterModule, ReactiveFormsModule, FormsModule],
  styleUrl: `./product-list.component.scss`,
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: any[] = [];
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  pageSize = ProductItemsPerPage;
  searchTerm = '';
  selectedCategory: string = '';
  categories: Category[] = [];
  loading = false;
  error: string | null = null;

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;
  private loadProductsSubject = new Subject<void>();
  private loadProductsSubscription: Subscription;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    public imageService: ImageService,
  ) {
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadProducts();
      });

    this.loadProductsSubscription = this.loadProductsSubject
      .pipe(debounceTime(100))
      .subscribe(() => this.loadProducts());
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
    this.loadProductsSubscription.unsubscribe();
  }

  loadCategories(): void {
    this.productService
      .getCategories()
      .pipe(take(1))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.notificationService.show({
            message: 'Failed to load categories',
            type: 'error',
          });
        },
      });
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts(page);
  }

  private loadProducts(page: number = 1): void {
    this.loading = true;
    this.error = null;
    this.currentPage = page;

    this.productService
      .getProducts(page, this.searchTerm, this.selectedCategory)
      .subscribe({
        next: (response) => {
          this.products = response.products || [];
          this.totalItems = response.total || 0;
          this.totalPages = response.pages || 1;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.error = 'Failed to load products. Please try again later.';
          this.loading = false;
        },
      });
  }

  addToCart(product: any): void {
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (!isAuthenticated) {
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: this.router.url },
        });
        return;
      }

      this.cartService.addToCart(product._id, 1).subscribe({
        next: (response) => {
          this.notificationService.show({
            message: `${product.name} added to cart`,
            type: 'success',
          });
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
          this.notificationService.show({
            message: 'Failed to add item to cart',
            type: 'error',
          });
        },
      });
    });
  }

  isLoggedIn(): boolean {
    let isAuthenticated = false;
    this.authService.isAuthenticated$.subscribe((authState) => {
      isAuthenticated = authState?.auth || false;
    });
    return isAuthenticated;
  }

  viewProduct(id: any): void {
    this.router.navigate(['/products', id]);
  }

  /*
  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }
*/

  getProductImageUrl(imageUrl: string | undefined): string {
    return imageUrl ? this.imageService.getImagePreview(imageUrl) : '';
  }

  getProductRating(reviews: any[]): number {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
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

  /*  viewProduct(id: string): void {
    this.router.navigate(['/products', id]);
  }*/
}
