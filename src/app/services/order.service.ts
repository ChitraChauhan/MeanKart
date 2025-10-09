import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  totalPrice: number;
}

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  payment: {
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    status: string;
    amount: number;
    currency: string;
    method?: string;
    paidAt?: Date;
  };
  shippingAddress: ShippingAddress;
  status: 'created' | 'attempted' | 'paid';
  shippingStatus:
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded'
    | 'failed';
  createdAt: Date;
  updatedAt: Date;
  formattedDate?: string;
  statusDisplay?: string;
}

interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  totalAmount: number;
  tax?: number;
  shipping?: number;
  razorpayOrderId?: string;
}

interface UpdateOrderPaymentRequest {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = environment.apiUrl + '/api/orders';

  constructor(private http: HttpClient) {}

  /**
   * Create a new order
   */
  createOrder(
    orderData: CreateOrderRequest,
  ): Observable<{ success: boolean; order: Order }> {
    return this.http.post<{ success: boolean; order: Order }>(
      this.apiUrl,
      orderData,
    );
  }

  /**
   * Get order by ID
   */
  getOrderById(
    orderId: string,
  ): Observable<{ success: boolean; order: Order }> {
    return this.http.get<{ success: boolean; order: Order }>(
      `${this.apiUrl}/${orderId}`,
    );
  }

  /**
   * Get current user's orders
   */
  getMyOrders(params?: { page?: number; limit?: number }): Observable<{
    success: boolean;
    orders: Order[];
    count: number;
    total: number;
    pages: number;
    currentPage: number;
  }> {
    return this.http.get<{
      success: boolean;
      orders: Order[];
      count: number;
      total: number;
      pages: number;
      currentPage: number;
    }>(`${this.apiUrl}/my-orders`, {
      params: params as any,
    });
  }

  /**
   * Update order payment details
   */
  updateOrderPayment(
    orderId: string,
    paymentData: UpdateOrderPaymentRequest,
  ): Observable<{ success: boolean; order: Order }> {
    return this.http.put<{ success: boolean; order: Order }>(
      `${this.apiUrl}/${orderId}/pay`,
      paymentData,
    );
  }

  /**
   * Format order date
   */
  formatOrderDate(dateString: string | Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  /**
   * Get status display text
   */
  getStatusDisplay(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
      failed: 'Failed',
    };
    return statusMap[status] || status;
  }

  /**
   * Get status class for styling
   */
  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }
}
