/** Domain types for the two demo datasets. */

export interface Address {
  city: string;
  state: string;
  country: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  joinDate: string; // yyyy-MM-dd
  isActive: boolean;
  skills: string[];
  address: Address;
  projects: number;
  lastReview: string; // yyyy-MM-dd
  performanceRating: number;
}

export interface Merchant {
  name: string;
  city: string;
  country: string;
}

export type PaymentMethod = 'Card' | 'Bank' | 'UPI' | 'Wallet';
export type TransactionStatus = 'Completed' | 'Pending' | 'Failed' | 'Refunded';

export interface Transaction {
  id: number;
  transactionId: string;
  customer: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  isRefunded: boolean;
  category: string;
  tags: string[];
  createdAt: string; // yyyy-MM-dd
  merchant: Merchant;
}
