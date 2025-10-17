import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { ModalService } from '../../services/modal.service';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-cart',
  templateUrl: `./cart.component.html`,
  imports: [DecimalPipe, AsyncPipe, RouterLink],
  styleUrl: `./cart.component.scss`,
})
export class CartComponent implements OnInit {
  cart$: Observable<any>;

  constructor(
    private cartService: CartService,
    private modalService: ModalService,
    private router: Router,
    public imageService: ImageService,
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
      cancelText: 'No, keep items',
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
      cancelText: 'Continue shopping',
    });

    if (confirmed) {
      this.router.navigate(['/checkout']);
    }
  }
}
