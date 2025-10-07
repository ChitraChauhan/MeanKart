// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin-guard';
import { NoAuthGuard } from './guards/no-auth.guard';
import { ProductListComponent } from './components/product-list/product-list';
import { CartComponent } from './components/cart/cart.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { AdminDashboard } from './components/admin/dashboard/dashboard';
import { AdminProductsComponent } from './components/admin/products/products.component';
import { ProductFormComponent } from './components/admin/product-form/product-form.component';
import {NoAdminGuard} from './guards/no-admin-guard';

export const routes: Routes = [
  {
    path: '',
    component: ProductListComponent,
    canActivate: [NoAdminGuard]
  },
  {
    path: 'products',
    component: ProductListComponent,
    canActivate: [NoAdminGuard]
  },
  {
    path: 'products/:id',
    component: ProductDetailComponent,
    canActivate: [NoAdminGuard]
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [AuthGuard, NoAdminGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/user/profile/profile').then(m => m.Profile),
    canActivate: [AuthGuard]
  },
  // Admin routes
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: AdminDashboard
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            component: AdminProductsComponent
          },
          {
            path: 'new',
            component: ProductFormComponent
          },
          {
            path: 'edit/:id',
            component: ProductFormComponent
          }
        ]
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NoAuthGuard]  // Prevent access if already logged in
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [NoAuthGuard]  // Prevent access if already logged in
  },
  { path: '**', redirectTo: '' }
];
