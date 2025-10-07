// src/app/services/auth.service.ts
import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, map, Observable, of} from 'rxjs';
import {tap, catchError} from 'rxjs/operators';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {isPlatformBrowser} from '@angular/common';
import {jwtDecode} from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private isAuthenticatedSubject: BehaviorSubject<{ auth: boolean, isAdmin: boolean, name?: string }>;
  isAuthenticated$: Observable<{ auth: boolean, isAdmin: boolean, name?: string }>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isAuthenticatedSubject = new BehaviorSubject<{ auth: boolean, isAdmin: boolean, name?: string }>({
      auth: false,
      isAdmin: false,
      name: ''
    });
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    if (isPlatformBrowser(this.platformId)) {
      const hasToken = this.cookieService.check('auth_token');
      if (hasToken) {
        // Try to get user info from token or API if needed
        const token = this.getToken();
        if (token) {
          const userInfo: any = this.getUserFromToken(token);
          this.isAuthenticatedSubject.next({
            auth: true,
            isAdmin: userInfo?.isAdmin ?? false,
            name: userInfo?.name ?? ''
          });
          return;
        }
      }
      this.isAuthenticatedSubject.next({auth: false, isAdmin: false, name: ''});
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          // Set cookie with 1 day expiration, secure flag, and httpOnly flag
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 1);

          this.cookieService.set('auth_token', response.token, {
            expires: expirationDate,
            path: '/',
            secure: window.location.protocol === 'https:',
            sameSite: 'Strict'
          });

          this.isAuthenticatedSubject.next({auth: true, isAdmin: response.isAdmin, name: response.name});
        }
      })
    );
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      tap((response: any) => {
        if (response.token) {
          // Set cookie with 1 day expiration, secure flag, and httpOnly flag
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 1);

          this.cookieService.set('auth_token', response.token, {
            expires: expirationDate,
            path: '/',
            secure: window.location.protocol === 'https:',
            sameSite: 'Strict'
          });

          this.isAuthenticatedSubject.next({auth: true, isAdmin: response.isAdmin,name: response.name});
        }
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cookieService.delete('auth_token', '/');
    }
    this.isAuthenticatedSubject.next({auth: false, isAdmin: false});
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return this.cookieService.get('auth_token') || null;
    }
    return null;
  }

  private getUserFromToken(token: string): { isAdmin: boolean; name: string } | null {
    try {
      const payload: any = jwtDecode(token);
      return {
        isAdmin: payload.isAdmin || false,
        name: payload.name || ''
      };
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  isAdmin(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }

    return this.http.get<any>(`${this.apiUrl}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      map(user => user?.isAdmin === true),
      catchError(() => of(false))
    );
  }

  updateUserInfo(userInfo: { name?: string; email?: string }): void {
    const currentValue = this.isAuthenticatedSubject.value;
    this.isAuthenticatedSubject.next({
      ...currentValue,
      name: userInfo.name ?? currentValue.name
    });
  }
}
