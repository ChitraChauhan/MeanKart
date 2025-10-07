// src/app/components/header/header.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { distinctUntilChanged } from 'rxjs';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
  ],
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  isAdmin = false;
  cartItemCount = 0;
  userName: string = '';

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.authService.isAuthenticated$.subscribe(({auth, isAdmin, name}) => {
      this.isAuthenticated = auth;
      this.isAdmin = isAdmin;
      this.userName = name || '';
    });

    this.cartService.cart$.pipe(distinctUntilChanged()).subscribe((items: any) => {
      this.cartItemCount = items?.items.reduce((total: any, item: any) => total + item.quantity, 0);
    });
  }

  private loadUserProfile(): void {
    this.userService.getProfile().subscribe({
      next: ({name, isAdmin}) => {
        this.isAuthenticated = true;
        this.isAdmin = isAdmin;
        this.userName = name || '';
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
