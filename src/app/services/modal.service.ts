import { Injectable } from '@angular/core';
import { modal } from './modal';
import { AlertOptions, ConfirmOptions } from '../common/constant';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  constructor() {}

  /**
   * Shows an alert dialog with a single confirmation button
   * @param options Alert configuration
   * @returns Promise that resolves when the alert is closed
   */
  showAlert(options: AlertOptions): Promise<boolean> {
    return modal.showAlert({
      title: options.title,
      message: options.message,
      confirmText: options.confirmText,
    });
  }

  /**
   * Shows a confirmation dialog with confirm and cancel buttons
   * @param options Confirm dialog configuration
   * @returns Promise that resolves to true if confirmed, false if cancelled
   */
  showConfirm(options: ConfirmOptions): Promise<boolean> {
    return modal.showConfirm({
      title: options.title,
      message: options.message,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
    });
  }
}
