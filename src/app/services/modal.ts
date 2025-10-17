import { ModalOptions } from '../common/constant';

class TailwindModal {
  private modal: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private titleElement: HTMLElement | null = null;
  private messageElement: HTMLElement | null = null;
  private buttonsContainer: HTMLElement | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.modal = document.createElement('div');
    this.modal.className =
      'fixed inset-0 z-50 hidden items-center justify-center p-4';
    this.modal.id = 'tailwind-modal';

    this.overlay = document.createElement('div');
    this.overlay.className =
      'fixed inset-0 bg-black bg-opacity-50 transition-opacity';
    this.overlay.id = 'modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className =
      'relative bg-white rounded-lg shadow-xl max-w-md w-full p-6';

    this.titleElement = document.createElement('h3');
    this.titleElement.className = 'text-xl font-semibold text-gray-900 mb-4';

    this.messageElement = document.createElement('div');
    this.messageElement.className = 'text-gray-600 mb-6';

    this.buttonsContainer = document.createElement('div');
    this.buttonsContainer.className = 'flex justify-end space-x-3';

    modalContent.appendChild(this.titleElement);
    modalContent.appendChild(this.messageElement);
    modalContent.appendChild(this.buttonsContainer);

    this.modal.appendChild(this.overlay);
    this.modal.appendChild(modalContent);

    document.body.appendChild(this.modal);

    this.overlay.addEventListener('click', () => this.hide());
  }

  public showAlert({
    title,
    message,
    confirmText = 'OK',
  }: Omit<ModalOptions, 'cancelText'>): Promise<boolean> {
    return new Promise((resolve) => {
      if (
        !this.titleElement ||
        !this.messageElement ||
        !this.buttonsContainer
      ) {
        console.error('Modal elements not properly initialized');
        resolve(false);
        return;
      }

      this.titleElement.textContent = title;
      this.messageElement.innerHTML = message;

      this.buttonsContainer.innerHTML = '';

      const confirmBtn = document.createElement('button');
      confirmBtn.className =
        'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
      confirmBtn.textContent = confirmText;
      confirmBtn.addEventListener('click', () => {
        this.hide();
        resolve(true);
      });

      this.buttonsContainer.appendChild(confirmBtn);

      this.show();
    });
  }

  public showConfirm({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
  }: ModalOptions): Promise<boolean> {
    return new Promise((resolve) => {
      if (
        !this.titleElement ||
        !this.messageElement ||
        !this.buttonsContainer
      ) {
        console.error('Modal elements not properly initialized');
        resolve(false);
        return;
      }

      this.titleElement.textContent = title;
      this.messageElement.innerHTML = message;

      this.buttonsContainer.innerHTML = '';

      const cancelBtn = document.createElement('button');
      cancelBtn.className =
        'px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
      cancelBtn.textContent = cancelText;
      cancelBtn.addEventListener('click', () => {
        this.hide();
        resolve(false);
      });

      const confirmBtn = document.createElement('button');
      confirmBtn.className =
        'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
      confirmBtn.textContent = confirmText;
      confirmBtn.addEventListener('click', () => {
        this.hide();
        resolve(true);
      });

      this.buttonsContainer.appendChild(cancelBtn);
      this.buttonsContainer.appendChild(confirmBtn);

      this.show();
    });
  }

  private show(): void {
    if (!this.modal) return;
    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  private hide(): void {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
    this.modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
}

export const modal = new TailwindModal();

declare global {
  interface Window {
    Modal: typeof modal;
  }
}

window.Modal = modal;
