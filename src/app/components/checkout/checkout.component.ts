import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../services/payment.service';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../../environment';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';
import {
  CartItem,
  RazorpayOrder,
  RazorpayResponse,
} from '../../common/constant';

declare var Razorpay: any;

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  imports: [DecimalPipe],
})
export class CheckoutComponent implements OnInit {
  totalAmount: number = 0;
  isLoading = true;
  hasAddress = false;

  constructor(
    private paymentService: PaymentService,
    private cartService: CartService,
    private router: Router,
    private notificationService: NotificationService,
    private userService: UserService,
  ) {}

  ngOnInit() {
    this.loadCart();
    this.checkUserAddress();
  }

  checkUserAddress() {
    this.userService.getUserAddresses().subscribe({
      next: (addresses) => {
        this.hasAddress = addresses && addresses.length > 0;
      },
      error: (error) => {
        console.error('Error checking user addresses:', error);
        this.hasAddress = false;
      },
    });
  }

  loadCart() {
    this.cartService.getCart().subscribe({
      next: (cart: any) => {
        this.totalAmount = cart?.total || 0;
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

    if (!this.hasAddress) {
      this.notificationService.show({
        type: 'info',
        message: 'Please add a shipping address before proceeding to payment',
        duration: 3000,
      });
      this.router.navigate(['/profile']);
      return;
    }

    this.isLoading = true;

    try {
      let cartItems: CartItem[] = [];
      this.cartService.getCart().subscribe((cart) => {
        if (!cart || !cart.items || cart.items.length === 0) {
          throw new Error('No items in cart');
        } else {
          cartItems = cart?.items;
        }
      });

      this.paymentService
        .createOrder(this.totalAmount, cartItems || [])
        .subscribe((response: RazorpayOrder) => {
          const razorpayOrder = response;

          const options = {
            key: environment.RAZORPAY_KEY_ID,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency || 'INR',
            name: 'MeanKart',
            description: 'Test Transaction',
            order_id: razorpayOrder.id,
            items: cartItems,
            handler: async (response: RazorpayResponse) => {
              const verification: any = await this.paymentService
                .verifyPayment(response)
                .toPromise();
              if (verification.success) {
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
                  message: 'Payment Successful! Your order has been placed.',
                  duration: 3000,
                });
              } else {
                this.notificationService.show({
                  type: 'error',
                  message: 'Payment verification failed ❌',
                  duration: 3000,
                });
              }
            },
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
                this.isLoading = false;
              },
            },
          };

          const rzp = new Razorpay(options);
          rzp.open();

          const destroyCheckout = this.router.events.subscribe(() => {
            rzp.close();
            destroyCheckout.unsubscribe();
          });
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
}
