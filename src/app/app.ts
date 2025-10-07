import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, signal} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import {AuthService} from './services/auth.service';
import { NotificationService } from './services/notification.service';
import {NotificationComponent} from './components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, NotificationComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  /*schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],*/
})
export class App implements OnInit {
  protected readonly title = signal('client');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.getToken()) {
      this.authService.isAuthenticated$.subscribe(({auth}) => {
        if (!auth) {
          this.router.navigate(['/login']);
        }
      });
    }
  }
}
