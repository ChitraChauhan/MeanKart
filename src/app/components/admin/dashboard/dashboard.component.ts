import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { NotificationService } from '../../../services/notification.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class AdminDashboard implements OnInit {
  users: any[] = [];
  products: any[] = [];
  loading = false;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.notificationService.show({
          type: 'error',
          message: 'Failed to load users',
          duration: 3000,
        });
        this.loading = false;
      },
    });
  }

  async deleteUser(userId: string): Promise<void> {
    const confirmed = await this.modalService.showConfirm({
      title: 'Delete User',
      message:
        'Are you sure you want to delete this user? This action cannot be undone.',
      confirmText: 'Delete User',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter((user) => user._id !== userId);
          this.notificationService.show({
            type: 'success',
            message: 'User deleted successfully',
            duration: 3000,
          });
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.notificationService.show({
            type: 'error',
            message:
              error.error?.message ||
              'Failed to delete user. Please try again.',
            duration: 3000,
          });
        },
      });
    }
  }

  toggleUserStatus(user: any): void {
    const updatedUser = { ...user, isAdmin: !user.isAdmin };
    this.adminService.updateUser(user._id, updatedUser).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex((u) => u._id === updatedUser._id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.notificationService.show({
          type: 'success',
          message: 'User updated successfully',
          duration: 3000,
        });
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.notificationService.show({
          type: 'error',
          message: 'Failed to update user',
          duration: 3000,
        });
      },
    });
  }

  getLastActiveTime(lastActive: string): string {
    if (!lastActive) return 'Never';

    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - lastActiveDate.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }

  isUserActive(user: any): boolean {
    if (!user.lastActive) return false;
    const lastActive = new Date(user.lastActive).getTime();
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
    return lastActive > thirtyMinutesAgo;
  }
}
