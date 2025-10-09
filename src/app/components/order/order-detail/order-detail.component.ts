import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, Order } from '../../../services/order.service';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { environment } from '../../../../../environment';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
  imports: [CommonModule, CurrencyPipe, DatePipe],
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  error: string | null = null;
  ASSET_BASE_URL = environment.assetsBaseUrl || 'assets/';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.error = 'No order ID provided';
      this.loading = false;
    }
  }

  onBackToOrders(): void {
    this.router.navigate(['/my-orders']);
  }

  printOrder(): void {
    window.print();
  }

  private loadOrder(orderId: string): void {
    this.loading = true;
    this.error = null;

    this.orderService.getOrderById(orderId).subscribe({
      next: (response) => {
        if (response.success && response.order) {
          this.order = response.order;
        } else {
          this.error = 'Order not found';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading order:', err);
        this.error = 'Failed to load order. Please try again later.';
        this.loading = false;
      },
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-green-100 text-green-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800',
    };
    return statusClasses[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }

  getPaymentStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
    };
    return statusClasses[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }
}
