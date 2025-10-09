import { Component, OnInit } from '@angular/core';
import {
  PaymentService,
  CreateOrderResponse,
  PaymentVerificationData,
  PaymentVerificationResponse,
} from '../../services/payment.service';
import { Cart, CartItem, CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../../environment';
import { NotificationService } from '../../services/notification.service';

declare var Razorpay: any;

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  imports: [DecimalPipe],
})
export class CheckoutComponent implements OnInit {
  totalAmount: number = 0;
  isLoading = true;

  constructor(
    private paymentService: PaymentService,
    private cartService: CartService,
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cartService.getCart().subscribe({
      next: (cart: any) => {
        this.totalAmount = cart.total || 0;
        this.isLoading = false;

        if (this.totalAmount <= 0) {
          this.router.navigate(['/cart']);
        }
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.isLoading = false;
        this.router.navigate(['/cart']);
      },
    });
  }

  async payNow(): Promise<void> {
    if (this.totalAmount <= 0) {
      this.notificationService.show({
        type: 'error',
        message: 'Cannot process payment with zero amount',
        duration: 3000,
      });
      return;
    }

    this.isLoading = true;

    try {
      let cartItems: CartItem[] = [];
      this.cartService.getCart().subscribe((cart) => {
        if (!cart || !cart.items || cart.items.length === 0) {
          throw new Error('No items in cart');
        } else {
          cartItems = cart.items;
        }
      });

      this.paymentService
        .createOrder(this.totalAmount, cartItems || [])
        .subscribe({
          next: (response: CreateOrderResponse) => {
            if (!response.success || !response.order) {
              throw new Error(response.error || 'Failed to create order');
            }

            const razorpayOrder = response.order;

            const options = {
              key: environment.RAZORPAY_KEY_ID,
              amount: razorpayOrder.amount,
              currency: razorpayOrder.currency || 'USD',
              name: 'E-commerce Store',
              description: 'Order Payment',
              order_id: razorpayOrder.id,
              items: cartItems,
              handler: (response: RazorpayResponse) =>
                this.handlePaymentResponse(response),
              prefill: {
                name: 'Customer Name', // TODO: Get from user profile
                email: 'customer@example.com', // TODO: Get from user profile
                contact: '9876543210', // TODO: Get from user profile
              },
              theme: {
                color: '#3399cc',
              },
              modal: {
                ondismiss: () => {
                  this.notificationService.show({
                    type: 'info',
                    message: 'Payment window closed',
                    duration: 2000,
                  });
                },
              },
            };

            const rzp = new Razorpay(options);
            rzp.open();

            const destroyCheckout = this.router.events.subscribe(() => {
              rzp.close();
              destroyCheckout.unsubscribe();
            });
          },
          error: (error: any) => {
            console.error('Create order error:', error);
            this.notificationService.show({
              type: 'error',
              message: 'Failed to create payment order. Please try again.',
              duration: 3000,
            });
            this.isLoading = false;
          },
        });
    } catch (error) {
      console.error('Payment initialization error:', error);
      this.notificationService.show({
        type: 'error',
        message: 'Error initializing payment. Please try again.',
        duration: 3000,
      });
      this.isLoading = false;
    }
  }

  private async handlePaymentResponse(
    response: RazorpayResponse,
  ): Promise<void> {
    try {
      const verification = await this.paymentService
        .verifyPayment({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        })
        .toPromise();

      if (!verification) {
        throw new Error('No response from payment verification');
      }

      if (verification.success) {
        this.cartService.clearCart().subscribe({
          next: () => this.handleSuccessfulPayment(response, verification),
          error: (error) => this.handleCartClearError(error, response),
        });
      } else {
        this.notificationService.show({
          type: 'error',
          message:
            verification?.message ||
            'Payment verification failed. Please contact support.',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      this.notificationService.show({
        type: 'error',
        message:
          'Error processing your payment. Please check your order status or contact support.',
        duration: 3000,
      });
      this.router.navigate(['/my-orders']);
    }
  }

  private handleSuccessfulPayment(
    response: RazorpayResponse,
    verification: PaymentVerificationResponse,
  ): void {
    console.log('Payment successful:', response);

    this.cartService.clearCart().subscribe({
      next: () => {
        console.log('Cart cleared after successful order');
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
      },
    });

    this.notificationService.show({
      type: 'success',
      message: 'Payment successful! Your order has been placed.',
      duration: 5000,
    });

    this.router
      .navigateByUrl('/my-orders', {
        state: {
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
        },
        replaceUrl: true,
      })
      .then((navigated) => {
        if (!navigated) {
          console.error('Navigation to /orders failed');
          this.router.navigate(['/']);
        }
      });
  }

  private handleCartClearError(error: any, response: RazorpayResponse): void {
    console.error('Error clearing cart:', error);
    this.notificationService.show({
      type: 'success',
      message: 'Payment successful! There was an issue updating your cart.',
      duration: 3000,
    });
    this.router.navigate(['/my-orders']);
  }
}
