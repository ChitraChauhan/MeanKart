// cart.component.ts
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { ModalService } from '../../services/modal.service';
import {AsyncPipe, DecimalPipe} from '@angular/common';
import {environment} from '../../../../environment';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: `./cart.component.html`,
  imports: [
    DecimalPipe,
    AsyncPipe,
    RouterLink
  ],
  styleUrls: [`./cart.component.scss`]
})
export class CartComponent implements OnInit {
  cart$: Observable<any>;
  ASSET_BASE_URL = environment.assetsBaseUrl || 'assets/';

  constructor(
    private cartService: CartService,
    private modalService: ModalService,
    private router: Router  // Add this
  ) {
    this.cart$ = this.cartService.getCart();
  }

  ngOnInit(): void {}

  updateQuantity(itemId: string, newQuantity: number): void {
    if (newQuantity < 1) return;
    this.cartService.updateItemQuantity(itemId, newQuantity).subscribe();
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId).subscribe();
  }

  async clearCart(): Promise<void> {
    const confirmed = await this.modalService.showConfirm({
      title: 'Clear Cart',
      message: 'Are you sure you want to clear your cart?',
      confirmText: 'Yes, clear cart',
      cancelText: 'No, keep items'
    });

    if (confirmed) {
      this.cartService.clearCart().subscribe();
    }
  }

  async checkout(): Promise<void> {
    const confirmed = await this.modalService.showConfirm({
      title: 'Proceed to Checkout',
      message: 'Are you ready to complete your purchase?',
      confirmText: 'Yes, checkout',
      cancelText: 'Continue shopping'
    });

    if (confirmed) {
      this.router.navigate(['/checkout']);

      // Add your checkout navigation or API call here
      // this.router.navigate(['/checkout']);
    }
  }
}
