import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';
import { Address, UserProfile } from '../common/constant';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl + '/api/users';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  updateProfile(profileData: UserProfile): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, profileData);
  }

  changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/change-password`,
      passwordData,
    );
  }

  getUserAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/addresses`);
  }

  getAddress(addressId: string): Observable<Address> {
    return this.http.get<Address>(`${this.apiUrl}/addresses/${addressId}`);
  }

  addAddress(addressData: Omit<Address, '_id'>): Observable<Address> {
    return this.http.post<Address>(`${this.apiUrl}/addresses`, addressData);
  }

  updateAddress(
    addressId: string,
    addressData: Partial<Address>,
  ): Observable<Address> {
    return this.http.put<Address>(
      `${this.apiUrl}/addresses/${addressId}`,
      addressData,
    );
  }

  deleteAddress(addressId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/addresses/${addressId}`,
    );
  }

  setDefaultAddress(addressId: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/addresses/${addressId}/set-default`,
      {},
    );
  }
}
