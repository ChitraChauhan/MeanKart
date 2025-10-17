import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { UserService, UserProfile } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

export interface Address {
  _id?: string;
  name: string;
  phone: string;
  address: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: `./profile.component.html`,
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  addresses: Address[] = [];
  addressForm: FormGroup = new FormGroup({});
  isEditingAddress = false;
  currentAddressId: string | null = null;
  showAddressForm = false;

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
    private notificationService: NotificationService,
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      email: [
        { value: '', disabled: true },
        [Validators.required, Validators.email],
      ],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required, Validators.minLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );

    this.initAddressForm();
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadAddresses();
  }

  private initAddressForm(): void {
    this.addressForm = this.fb.group({
      name: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      address: ['', [Validators.required]],
      addressLine2: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      postalCode: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{5,10}$')],
      ],
      country: ['', [Validators.required]],
      isDefault: [false],
    });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  private loadUserProfile(): void {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          name: profile.name,
          email: profile.email,
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.notificationService.show({
          type: 'error',
          message: 'Failed to load profile. Please try again.',
          duration: 3000,
        });
        this.loading = false;
      },
    });
  }

  private loadAddresses(): void {
    this.userService.getUserAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.notificationService.show({
          type: 'error',
          message: 'Failed to load addresses. Please try again.',
          duration: 3000,
        });
      },
    });
  }

  addNewAddress(): void {
    this.isEditingAddress = false;
    this.currentAddressId = null;
    this.addressForm.reset({ isDefault: false });
    this.showAddressForm = true;
  }

  editAddress(address: Address): void {
    this.isEditingAddress = true;
    this.currentAddressId = address._id || null;
    this.addressForm.patchValue({
      ...address,
    });
    this.showAddressForm = true;
  }

  onAddressSubmit(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const addressData = this.addressForm.value;
    const request =
      this.isEditingAddress && this.currentAddressId
        ? this.userService.updateAddress(this.currentAddressId, addressData)
        : this.userService.addAddress(addressData);

    request.subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          message: `Address ${this.isEditingAddress ? 'updated' : 'added'} successfully`,
          duration: 3000,
        });
        this.showAddressForm = false;
        this.loadAddresses();
      },
      error: (error) => {
        console.error('Error saving address:', error);
        this.notificationService.show({
          type: 'error',
          message: `Failed to ${this.isEditingAddress ? 'update' : 'add'} address. Please try again.`,
          duration: 3000,
        });
      },
    });
  }

  deleteAddress(addressId: string): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.userService.deleteAddress(addressId).subscribe({
        next: () => {
          this.notificationService.show({
            type: 'success',
            message: 'Address deleted successfully',
            duration: 3000,
          });
          this.loadAddresses();
        },
        error: (error) => {
          console.error('Error deleting address:', error);
          this.notificationService.show({
            type: 'error',
            message: 'Failed to delete address. Please try again.',
            duration: 3000,
          });
        },
      });
    }
  }

  setDefaultAddress(addressId: string): void {
    this.userService.setDefaultAddress(addressId).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          message: 'Default address updated successfully',
          duration: 3000,
        });
        this.loadAddresses();
      },
      error: (error) => {
        console.error('Error setting default address:', error);
        this.notificationService.show({
          type: 'error',
          message: 'Failed to set default address. Please try again.',
          duration: 3000,
        });
      },
    });
  }

  cancelAddressForm(): void {
    this.showAddressForm = false;
    this.addressForm.reset({ isDefault: false });
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      const profileData = this.profileForm.getRawValue();

      this.userService.updateProfile(profileData).subscribe({
        next: (updatedProfile) => {
          this.notificationService.show({
            type: 'success',
            message: 'ProfileComponent updated successfully!',
            duration: 3000,
          });
          this.profileForm.markAsPristine();
          this.authService.updateUserInfo(updatedProfile);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.notificationService.show({
            type: 'error',
            message:
              error.error?.message ||
              'Failed to update profile. Please try again.',
            duration: 3000,
          });
        },
        complete: () => {
          this.loading = false;
        },
      });
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.loading = true;
      const { currentPassword, newPassword } = this.passwordForm.value;

      this.userService
        .changePassword({ currentPassword, newPassword })
        .subscribe({
          next: (response) => {
            this.notificationService.show({
              type: 'success',
              message: response.message || 'Password changed successfully!',
              duration: 3000,
            });
            this.passwordForm.reset();
          },
          error: (error) => {
            console.error('Error changing password:', error);
            this.notificationService.show({
              type: 'error',
              message:
                error.error?.message ||
                'Failed to change password. Please try again.',
              duration: 3000,
            });
          },
          complete: () => {
            this.loading = false;
          },
        });
    }
  }
}
