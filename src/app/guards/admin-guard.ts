import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  private apiUrl = environment.apiUrl + '/api/auth';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    return this.http
      .get<any>(`${this.apiUrl}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .pipe(
        map((user) => {
          if (user && user.isAdmin) {
            return true;
          }
          this.router.navigate(['/']);
          return false;
        }),
        catchError((error) => {
          console.error('Error fetching user details', error);
          this.router.navigate(['/login']);
          return of(false);
        }),
      );
  }
}
