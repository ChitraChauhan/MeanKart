import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

export interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  order?: any;
  error?: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  amount_due: number;
  amount_paid: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
  notes: any[];
}

export interface CreateOrderResponse {
  success: boolean;
  order: RazorpayOrder;
  razorpayOrderId: string;
  error?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = environment.apiUrl + '/api/payment';

  constructor(private http: HttpClient) {}

  createOrder(amount: number, items: any[] = []): Observable<RazorpayOrder> {
    return this.http.post<RazorpayOrder>(`${this.apiUrl}/order`, {
      amount: Math.round(amount),
      currency: 'INR',
      items: items.map((item) => ({
        productId: item.productId || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '',
      })),
    });
  }

  verifyPayment(
    data: PaymentVerificationData,
  ): Observable<PaymentVerificationResponse> {
    return this.http.post<PaymentVerificationResponse>(
      `${this.apiUrl}/verify`,
      {
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
      },
    );
  }

  getOrder(orderId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/order/${orderId}`);
  }
}
