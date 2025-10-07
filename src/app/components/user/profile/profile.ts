import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserService, UserProfile } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: `./profile.html`,
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Toggle password visibility
  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  private loadUserProfile(): void {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          name: profile.name,
          email: profile.email
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.notificationService.show({
          type: 'error',
          message: 'Failed to load profile. Please try again.',
          duration: 3000
        });
        this.loading = false;
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      const profileData = this.profileForm.getRawValue();

      this.userService.updateProfile(profileData).subscribe({
        next: (updatedProfile) => {
          this.notificationService.show({
            type: 'success',
            message: 'Profile updated successfully!',
            duration: 3000
          });
          this.profileForm.markAsPristine();
          // Update the auth service with new name if needed
          this.authService.updateUserInfo(updatedProfile);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.notificationService.show({
            type: 'error',
            message: error.error?.message || 'Failed to update profile. Please try again.',
            duration: 3000
          });
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.loading = true;
      const { currentPassword, newPassword } = this.passwordForm.value;

      this.userService.changePassword({ currentPassword, newPassword }).subscribe({
        next: (response) => {
          this.notificationService.show({
            type: 'success',
            message: response.message || 'Password changed successfully!',
            duration: 3000
          });
          this.passwordForm.reset();
        },
        error: (error) => {
          console.error('Error changing password:', error);
          this.notificationService.show({
            type: 'error',
            message: error.error?.message || 'Failed to change password. Please try again.',
            duration: 3000
          });
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }
}
