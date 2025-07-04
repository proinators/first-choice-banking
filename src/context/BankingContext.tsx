'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Transaction {
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

interface Account {
  id: number;
  name: string;
  number: string;
  type: string;
  balance: number;
  available?: number;
  creditLimit?: number;
}

interface BankingContextType {
  accounts: Account[];
  transactions: Transaction[];
  updateAccount: (accountId: number, newBalance: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'reference'>) => void;
  getAccountById: (id: number) => Account | undefined;
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

export const useBanking = () => {
  const context = useContext(BankingContext);
  if (!context) {
    throw new Error('useBanking must be used within a BankingProvider');
  }
  return context;
};

export const BankingProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with mock data
  const [accounts, setAccounts] = useState<Account[]>([
    { id: 1, name: 'Main Account', number: '•••• 7890', type: 'Savings', balance: 125000.50, available: 120000.00 },
    { id: 2, name: 'Salary Account', number: '•••• 4321', type: 'Salary', balance: 350000.75, available: 350000.75 },
    { id: 3, name: 'Credit Card', number: '•••• 5678', type: 'Credit Card', balance: -12500.30, available: 87500.00, creditLimit: 100000.00 },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load transactions from localStorage on initial render
  useEffect(() => {
    const savedTransactions = localStorage.getItem('bankingTransactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      // Initialize with some mock transactions if none exist
      const initialTransactions: Transaction[] = [
        {
          id: '1',
          date: new Date('2024-06-15T10:30:00').toISOString(),
          description: 'Supermarket Purchase',
          amount: 1250.50,
          type: 'debit',
          status: 'completed',
          category: 'Groceries',
          reference: 'TXN20240615001',
          account: '•••• 7890'
        },
        {
          id: '2',
          date: new Date('2024-06-01T09:15:00').toISOString(),
          description: 'Salary Credit',
          amount: 125000.00,
          type: 'credit',
          status: 'completed',
          category: 'Salary',
          reference: 'SAL20240601001',
          account: '•••• 7890'
        },
        {
          id: '3',
          date: new Date('2024-05-28T14:20:00').toISOString(),
          description: 'Electricity Bill',
          amount: 4500.75,
          type: 'debit',
          status: 'completed',
          category: 'Utilities',
          reference: 'BL20240528001',
          account: '•••• 7890'
        },
        {
          id: '4',
          date: new Date('2024-05-25T11:45:00').toISOString(),
          description: 'UPI Transfer',
          amount: 2500.00,
          type: 'debit',
          status: 'completed',
          category: 'Transfer',
          reference: 'UPI20240525001',
          account: '•••• 7890'
        },
        {
          id: '5',
          date: new Date('2024-05-20T16:30:00').toISOString(),
          description: 'Mobile Recharge',
          amount: 599.00,
          type: 'debit',
          status: 'completed',
          category: 'Mobile',
          reference: 'RCH20240520001',
          account: '•••• 4321'
        },
        {
          id: '6',
          date: new Date('2024-05-18T13:15:00').toISOString(),
          description: 'Credit Card Payment',
          amount: 15000.00,
          type: 'debit',
          status: 'pending',
          category: 'Credit Card',
          reference: 'CC20240518001',
          account: '•••• 7890'
        },
        {
          id: '7',
          date: new Date('2024-04-28T16:45:00').toISOString(),
          description: 'Internet Bill',
          amount: 999.00,
          type: 'debit',
          status: 'failed',
          category: 'Utilities',
          reference: 'NET20240425001',
          account: '•••• 7890'
        }
      ];
      setTransactions(initialTransactions);
      localStorage.setItem('bankingTransactions', JSON.stringify(initialTransactions));
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('bankingTransactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  const updateAccount = (accountId: number, newBalance: number) => {
    setAccounts(prevAccounts =>
      prevAccounts.map(account =>
        account.id === accountId
          ? { ...account, balance: newBalance, available: newBalance - (account.creditLimit || 0) }
          : account
      )
    );
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'reference'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      reference: `TXN${Date.now()}`,
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update account balance
    const account = accounts.find(acc => acc.number === transaction.account);
    if (account) {
      const newBalance = transaction.type === 'credit'
        ? account.balance + transaction.amount
        : account.balance - transaction.amount;
      
      updateAccount(account.id, newBalance);
    }
    
    return newTransaction;
  };

  const getAccountById = (id: number) => {
    return accounts.find(account => account.id === id);
  };

  return (
    <BankingContext.Provider
      value={{
        accounts,
        transactions,
        updateAccount,
        addTransaction,
        getAccountById,
      }}
    >
      {children}
    </BankingContext.Provider>
  );
};
