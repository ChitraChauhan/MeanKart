import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../../environment';
import { NotificationService } from '../../services/notification.service';

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
  ASSET_BASE_URL = environment.assetsBaseUrl || 'assets/';
  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService,
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
        this.error = 'Failed to load product details';
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
}
