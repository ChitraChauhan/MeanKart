import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';
import {
  PaymentVerificationResponse,
  RazorpayOrder,
  RazorpayResponse,
} from '../common/constant';

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
    data: RazorpayResponse,
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
