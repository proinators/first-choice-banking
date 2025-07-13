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

interface FixedDeposit {
  id: number;
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

interface CreditCard {
  id: number;
  name: string; // Card holder name
  number: string; // masked card number e.g., •••• 1234
  type: string; // e.g., Standard, Gold, Platinum
  creditLimit: number;
  balance: number; // negative when spent
  available: number;
  issuedDate: string;
}

interface BankingContextType {
  accounts: Account[];
  transactions: Transaction[];
  fixedDeposits: FixedDeposit[];
  creditCards: CreditCard[];
  updateAccount: (accountId: number, newBalance: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'reference'>) => void;
  addFixedDeposit: (fd: Omit<FixedDeposit, 'id' | 'fdNumber' | 'status'>) => void;
  addCreditCard: (card: Omit<CreditCard, 'id' | 'number' | 'available' | 'issuedDate' | 'balance'>) => CreditCard;
  getAccountById: (id: number) => Account | undefined;
  getFixedDepositById: (id: number) => FixedDeposit | undefined;
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
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

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

  // Load fixed deposits from localStorage
  useEffect(() => {
    const savedFDs = localStorage.getItem('bankingFixedDeposits');
    if (savedFDs) {
      setFixedDeposits(JSON.parse(savedFDs));
    } else {
      // Initialize with some mock fixed deposits
      const initialFDs: FixedDeposit[] = [
        {
          id: 1,
          accountNumber: '•••• 1234',
          amount: 500000.00,
          maturityDate: '2024-12-31',
          interestRate: 6.5,
          tenure: 12,
          startDate: '2024-01-01',
          status: 'active',
          fdNumber: 'FD001234',
          interestPayout: 'maturity',
          nominee: 'John Doe Jr.'
        },
        {
          id: 2,
          accountNumber: '•••• 5678',
          amount: 1000000.00,
          maturityDate: '2025-06-30',
          interestRate: 7.0,
          tenure: 18,
          startDate: '2024-01-01',
          status: 'active',
          fdNumber: 'FD005678',
          interestPayout: 'quarterly',
          nominee: 'Jane Smith Jr.'
        }
      ];
      setFixedDeposits(initialFDs);
      localStorage.setItem('bankingFixedDeposits', JSON.stringify(initialFDs));
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('bankingTransactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  // Load credit cards from localStorage
  useEffect(() => {
    const savedCards = localStorage.getItem('bankingCreditCards');
    if (savedCards) {
      setCreditCards(JSON.parse(savedCards));
    }
  }, []);

  // Save credit cards to localStorage whenever they change
  useEffect(() => {
    if (creditCards.length > 0) {
      localStorage.setItem('bankingCreditCards', JSON.stringify(creditCards));
    }
  }, [creditCards]);

  // Save fixed deposits to localStorage whenever they change
  useEffect(() => {
    if (fixedDeposits.length > 0) {
      localStorage.setItem('bankingFixedDeposits', JSON.stringify(fixedDeposits));
    }
  }, [fixedDeposits]);

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

  const addCreditCard = (card: Omit<CreditCard, 'id' | 'number' | 'available' | 'issuedDate' | 'balance'>) => {
    const newCardNumber = `•••• ${Math.floor(1000 + Math.random() * 9000)}`;
    const newCard: CreditCard = {
      ...card,
      id: Date.now(),
      number: newCardNumber,
      balance: 0,
      available: card.creditLimit,
      issuedDate: new Date().toISOString(),
    };

    setCreditCards(prev => [newCard, ...prev]);

    // Also add to accounts list so it shows up with others
    const newAccount: Account = {
      id: newCard.id,
      name: `${card.type} Credit Card`,
      number: newCard.number,
      type: 'Credit Card',
      balance: 0,
      available: newCard.available,
      creditLimit: card.creditLimit,
    };
    setAccounts(prev => [...prev, newAccount]);

    return newCard;
  };

  const addFixedDeposit = (fd: Omit<FixedDeposit, 'id' | 'fdNumber' | 'status'>) => {
    const newFD: FixedDeposit = {
      ...fd,
      id: Date.now(),
      fdNumber: `FD${Date.now().toString().slice(-6)}`,
      status: 'active',
    };
    
    setFixedDeposits(prev => [newFD, ...prev]);
    
    // Add a transaction for the FD creation
    addTransaction({
      account: fd.accountNumber,
      type: 'debit',
      amount: fd.amount,
      description: `Fixed Deposit - ${newFD.fdNumber}`,
      date: new Date().toISOString(),
      status: 'completed',
      category: 'Fixed Deposit',
    });
    
    return newFD;
  };

  const getAccountById = (id: number) => {
    return accounts.find(account => account.id === id);
  };

  const getFixedDepositById = (id: number) => {
    return fixedDeposits.find(fd => fd.id === id);
  };

  // Update FD status to matured when they reach maturity date
  useEffect(() => {
    const today = new Date();
    setFixedDeposits(prev => 
      prev.map(fd => {
        const maturityDate = new Date(fd.maturityDate);
        if (fd.status === 'active' && maturityDate <= today) {
          return { ...fd, status: 'matured' as const };
        }
        return fd;
      })
    );
  }, []);

  return (
    <BankingContext.Provider
      value={{
        accounts,
        transactions,
        fixedDeposits,
        creditCards,
        updateAccount,
        addTransaction,
        addFixedDeposit,
        addCreditCard,
        getAccountById,
        getFixedDepositById,
      }}
    >
      {children}
    </BankingContext.Provider>
  );
};
