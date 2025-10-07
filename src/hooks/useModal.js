import { useState } from 'react';

export const useModal = () => {
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert', // 'alert' or 'confirm'
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
  });

  const showAlert = ({ title, message, confirmText = 'OK' }) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        title,
        message,
        type: 'alert',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
        confirmText,
        cancelText: '',
      });
    });
  };

  const showConfirm = ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
  }) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        title,
        message,
        type: 'confirm',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
        confirmText,
        cancelText,
      });
    });
  };

  const closeModal = () => {
    setModal((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  const handleConfirm = () => {
    if (modal.onConfirm) {
      modal.onConfirm();
    }
    closeModal();
  };

  const handleCancel = () => {
    if (modal.onCancel) {
      modal.onCancel();
    }
    closeModal();
  };

  return {
    modal: {
      ...modal,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
    showAlert,
    showConfirm,
    closeModal,
  };
};
