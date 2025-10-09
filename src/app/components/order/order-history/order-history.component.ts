import {Component, OnInit} from '@angular/core';
import {OrderService, Order} from '../../../services/order.service';
import {AuthService} from '../../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {CurrencyPipe} from '@angular/common';
import {environment} from '../../../../../environment';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  imports: [
    CurrencyPipe,
    RouterLink
  ],
  styleUrl: './order-history.component.scss'
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 1;
  ASSET_BASE_URL = environment.assetsBaseUrl || 'assets/';

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(({auth, isAdmin}) => {
      if (!auth) {
        this.router.navigate(['/login'], {queryParams: {returnUrl: '/my-orders'}});
        return;
      }
      // Only load orders if user is authenticated
      this.loadOrders();
    });
  }

  loadOrders(page: number = 1): void {
    this.isLoading = true;

    // Get the current page from the URL if available
    const urlPage = new URL(window.location.href).searchParams.get('page');
    const currentPage = urlPage ? +urlPage : page;

    this.orderService.getMyOrders({page: currentPage, limit: this.itemsPerPage})
      .subscribe({
        next: (response) => {
          console.log('Orders loaded:', response);
          this.orders = response.orders || [];
          this.currentPage = response.currentPage || currentPage;
          this.totalItems = response.total || 0;
          this.totalPages = response.pages || 1;
          this.isLoading = false;

          // Update URL to reflect current page
          this.router.navigate([], {
            relativeTo: this.router.routerState.root,
            queryParams: { page: this.currentPage },
            queryParamsHandling: 'merge'
          });
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          this.isLoading = false;
        }
      });
  }

  onPageChange(page: any): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadOrders(page);
    }
  }

  viewOrderDetails(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  getStatusClass(status: string): string {
    return this.orderService.getStatusClass(status);
  }

  getStatusDisplay(status: string): string {
    return this.orderService.getStatusDisplay(status);
  }

  formatDate(dateString: string | Date): string {
    return this.orderService.formatOrderDate(dateString);
  }

  /**
   * Generate pagination array with ellipsis
   */
  getPaginationArray(): (number | string)[] {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    const delta = 2; // Number of pages to show around the current page
    const range: (number | string)[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // First page
        i === totalPages || // Last page
        (i >= currentPage - delta && i <= currentPage + delta) // Pages around current
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }

    return range;
  }

  protected readonly Math = Math;
}
