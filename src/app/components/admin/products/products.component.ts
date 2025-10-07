// products.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminProductService } from '../../../services/admin-product.service';
import { Product } from '../../../models/admin-product.model';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { environment } from '../../../../../environment';
import { NotificationService } from '../../../services/notification.service';
import { ModalService } from '../../../services/modal.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-admin-products',
  templateUrl: './products.component.html',
  imports: [
    RouterLink,
    FormsModule,
    CurrencyPipe
  ],
  styleUrls: ['./products.component.scss']
})
export class AdminProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  pageSize = 9;
  searchTerm = '';
  loading = false;
  error: string | null = null;
  ASSET_BASE_URL = environment.assetsBaseUrl || 'assets/';

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;

  constructor(
    private productService: AdminProductService,
    private notificationService: NotificationService,
    private modalService: ModalService
  ) {
    // Set up the debounced search
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(1000), // Wait 500ms after the last event before emitting last value
      distinctUntilChanged() // Only emit if the current value is different than the last
    ).subscribe(term => {
      this.performSearch(term);
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(page: number = 1, searchTerm: string = this.searchTerm): void {
    this.loading = true;
    this.error = null;
    this.currentPage = page;

    this.productService.getProducts(page, searchTerm).subscribe({
      next: (response: { products: Product[]; page: number; pages: number; total: number; }) => {
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
      }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchTerm.trim());
  }

  private performSearch(term: string): void {
    this.loadProducts(1, term); // Reset to first page on new search
  }

  ngOnDestroy(): void {
    // Clean up the subscription to prevent memory leaks
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onPageChange(page: number): void {
    this.loadProducts(page);
  }

  // Add this to your component class
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5; // Show up to 5 page numbers
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
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

  async deleteProduct(id: any): Promise<void> {
    const confirmed = await this.modalService.showConfirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      confirmText: 'Yes, delete',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          // Show success notification
          this.notificationService.show({
            type: 'success',
            message: 'Product deleted successfully.',
            duration: 3000
          });

          // Reload current page after deletion
          const shouldGoToPreviousPage = this.products.length <= 1 && this.currentPage > 1;
          const newPage = shouldGoToPreviousPage ? this.currentPage - 1 : this.currentPage;
          this.loadProducts(newPage);
        },
        error: (err: any) => {
          console.error('Error deleting product:', err);
          this.notificationService.show({
            type: 'error',
            message: 'Failed to delete product. Please try again.',
            duration: 3000
          });
        }
      });
    }
  }
}
