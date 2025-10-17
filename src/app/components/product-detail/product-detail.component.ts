import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../../environment';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { UserService } from '../../services/user.service';
import { ImageService } from '../../services/image.service';
import {
  CartItem,
  RazorpayOrder,
  RazorpayResponse,
} from '../../common/constant';

declare var Razorpay: any;

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, DecimalPipe, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
  providers: [DecimalPipe],
})
export class ProductDetailComponent implements OnInit {
  product: any;
  loading = true;
  error: string | null = null;
  quantity = 1;
  currentImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private paymentService: PaymentService,
    private userService: UserService,
    public imageService: ImageService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      } else {
        this.router.navigate(['/products']);
      }
    });
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.error = null;

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.cartService.fetchCart().subscribe((cart) => {
          const cartProduct = cart?.items?.find(
            (item: any) => item.product?._id === this.product._id,
          );
          this.quantity = cartProduct?.quantity ?? 1;
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.error = 'Failed to load product details. Please try again.';
        this.loading = false;
      },
    });
  }

  addToCart(): void {
    if (this.product) {
      this.cartService
        .addToCart(this.product._id, this.quantity || 1)
        .subscribe({
          next: (res) => {
            this.router.navigate(['/cart']);
            this.notificationService.show({
              type: 'success',
              message: `${this.product.name} added to cart`,
              duration: 3000,
            });
          },
          error: (err) => {
            console.error('Error adding to cart:', err);
          },
        });
    }
  }

  updateQuantity(change: number): void {
    const newQuantity = this.quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      this.quantity = newQuantity;
    }
  }

  isInStock(): boolean {
    if (this.product.stock === undefined) return true;
    return this.product.stock > 0;
  }

  checkAddressAndProceed(): void {
    if (!this.product) return;

    this.authService.isAuthenticated$.subscribe(({ auth }) => {
      if (auth) {
        if (this.quantity <= 0) return;

        this.userService.getUserAddresses().subscribe({
          next: (addresses) => {
            if (addresses && addresses.length > 0) {
              this.initiatePayment();
            } else {
              this.notificationService.show({
                type: 'info',
                message:
                  'Please add a shipping address before proceeding to payment',
                duration: 3000,
              });
              this.router.navigate(['/profile']);
            }
          },
          error: (error) => {
            console.error('Error checking user addresses:', error);
            this.notificationService.show({
              type: 'error',
              message: 'Error checking your addresses. Please try again.',
              duration: 3000,
            });
          },
        });
      } else {
        this.router.navigate(['/login']);
        this.notificationService.show({
          type: 'info',
          message: 'Please login to continue with your purchase',
          duration: 3000,
        });
      }
    });
  }

  private initiatePayment(): void {
    if (!this.product) return;

    try {
      let cartItems: CartItem[] = [
        {
          product: this.product._id,
          quantity: this.quantity,
          price: this.product.price,
          name: this.product.name,
          image: this.product.imageUrl?.[0] || '',
        },
      ];

      const totalAmount = this.product.price * this.quantity;
      this.paymentService.createOrder(totalAmount, cartItems).subscribe({
        next: (response: RazorpayOrder) => {
          const razorpayOrder = response;

          const options = {
            key: environment.RAZORPAY_KEY_ID,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency || 'INR',
            name: 'MeanKart',
            description: 'Direct Purchase',
            order_id: razorpayOrder.id,
            items: cartItems,
            handler: async (response: RazorpayResponse) => {
              const verification: any = await this.paymentService
                .verifyPayment(response)
                .toPromise();
              if (verification.success) {
                this.notificationService.show({
                  type: 'success',
                  message: 'Payment Successful! Your order has been placed.',
                  duration: 5000,
                });
                this.router.navigate(['/orders']);
              } else {
                this.notificationService.show({
                  type: 'error',
                  message:
                    'Payment verification failed. Please contact support.',
                  duration: 5000,
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
        error: (error) => {
          console.error('Error creating order:', error);
          this.notificationService.show({
            type: 'error',
            message: 'Error creating order. Please try again.',
            duration: 3000,
          });
        },
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      this.notificationService.show({
        type: 'error',
        message: 'Error initializing payment. Please try again.',
        duration: 3000,
      });
    }
  }

  payNow(): void {
    this.checkAddressAndProceed();
  }

  nextImage(): void {
    if (this.product?.imageUrl?.length > 1) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.product.imageUrl.length;
    }
  }

  prevImage(): void {
    if (this.product?.imageUrl?.length > 1) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.product.imageUrl.length) %
        this.product.imageUrl.length;
    }
  }
}
