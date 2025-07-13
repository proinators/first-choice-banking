export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  category: string;
  reference: string;
  account: string;
}

export interface Account {
  id: string;
  name: string;
  number: string;
  type: string;
  balance: number;
  available?: number;
  creditLimit?: number;
}

export interface FixedDeposit {
  id: string;
  accountNumber: string;
  amount: number;
  maturityDate: string;
  interestRate: number;
  tenure: number; // in months
  startDate: string;
  status: 'active' | 'matured' | 'closed';
  fdNumber: string;
  interestPayout: 'monthly' | 'quarterly' | 'maturity';
  nominee?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface CreditCard {
  id: string;
  name: string; // Card holder name
  number: string; // masked card number e.g., •••• 1234
  type: string; // e.g., Standard, Gold, Platinum
  creditLimit: number;
  balance: number; // negative when spent
  available: number;
  issuedDate: string;
}
