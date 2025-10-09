import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  private idCounter = 0;

  show(notification: Omit<Notification, 'id'>) {
    const id = this.idCounter++;
    const newNotification = { ...notification, id };
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, newNotification]);

    if (notification.duration) {
      setTimeout(() => this.remove(id), notification.duration);
    }

    return id;
  }

  remove(id: number) {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next(
      currentNotifications.filter((n) => n.id !== id),
    );
  }

  clear() {
    this.notificationsSubject.next([]);
  }
}
