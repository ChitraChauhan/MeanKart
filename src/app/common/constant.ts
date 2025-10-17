export const ProductItemsPerPage = 12;

export const OrderItemsPerPage = 10;

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

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface CartItem {
  _id?: string;
  product:
    | string
    | { _id: string; name: string; price: number; imageUrl: string[] };
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Cart {
  _id?: string;
  user: string;
  items: CartItem[];
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
  Quantity: number;
}

export interface AlertOptions {
  title: string;
  message: string;
  confirmText?: string;
}

export interface ConfirmOptions extends AlertOptions {
  cancelText?: string;
}

export interface ModalOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export interface UserProfile {
  _id?: string;
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  isAdmin: boolean;
}

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
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginatedResponse<T> {
  products: T[];
  page: number;
  pages: number;
  total: number;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  order?: any;
  error?: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  amount_due: number;
  amount_paid: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
  notes: any[];
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  totalPrice: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface Order {
  _id: string;
  razorpayOrderId: string;
  userId: string;
  items: OrderItem[];
  shipping: number;
  amount: number;
  shippingAddress: ShippingAddress;
  status: 'created' | 'attempted' | 'paid';
  shippingStatus:
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded'
    | 'failed';
  createdAt: Date;
  updatedAt: Date;
  formattedDate?: string;
  statusDisplay?: string;
}

export interface UpdateOrderPaymentRequest {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string[];
  specifications?: {
    brand?: string;
    model?: string;
    color?: string;
    size?: string;
    weight?: number;
    [key: string]: any;
  };
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
