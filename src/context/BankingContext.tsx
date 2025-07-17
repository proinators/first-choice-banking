'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Account, Transaction, FixedDeposit, CreditCard } from '@/types';

interface BankingContextType {
  user: User | null;
  loading: boolean;
  accounts: Account[];
  transactions: Transaction[];
  fixedDeposits: FixedDeposit[];
  creditCards: CreditCard[];
  updateAccount: (accountId: string, newBalance: number) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'reference' | 'created_at' | 'account_id'> & { account_id: string }) => Promise<Transaction | null>;
  addFixedDeposit: (fd: Omit<FixedDeposit, 'id' | 'fdNumber' | 'status' | 'user_id'>) => Promise<FixedDeposit | null>;
  addCreditCard: (card: Omit<CreditCard, 'id' | 'number' | 'available' | 'issuedDate' | 'balance' | 'user_id'>) => Promise<CreditCard | null>;
  getAccountById: (id: string) => Account | undefined;
  getFixedDepositById: (id: string) => FixedDeposit | undefined;
  refreshData: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch accounts
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id);
        if (accountsData) setAccounts(accountsData);

        // Fetch transactions, fixed deposits, and credit cards
        if (accountsData) {
          const accountIds = accountsData.map(a => a.id);
          const { data: transactionsData } = await supabase
            .from('transactions')
            .select('*')
            .in('account_id', accountIds);
          if (transactionsData) setTransactions(transactionsData);
        }

        const { data: fdsData } = await supabase
          .from('fixed_deposits')
          .select('*')
          .eq('user_id', user.id);
        if (fdsData) setFixedDeposits(fdsData);

        const { data: cardsData } = await supabase
          .from('credit_cards')
          .select('*')
          .eq('user_id', user.id);
        if (cardsData) setCreditCards(cardsData);
      }
      setLoading(false);
    };

    fetchUserAndData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            setUser(session?.user ?? null);
            fetchUserAndData();
        } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setAccounts([]);
            setTransactions([]);
            setFixedDeposits([]);
            setCreditCards([]);
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, []);

  // Add refreshData method
  const refreshData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);
      if (accountsData) setAccounts(accountsData);

      if (accountsData) {
        const accountIds = accountsData.map(a => a.id);
        const { data: transactionsData } = await supabase
          .from('transactions')
          .select('*')
          .in('account_id', accountIds);
        if (transactionsData) setTransactions(transactionsData);
      }

      const { data: fdsData } = await supabase
        .from('fixed_deposits')
        .select('*')
        .eq('user_id', user.id);
      if (fdsData) setFixedDeposits(fdsData);

      const { data: cardsData } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id);
      if (cardsData) setCreditCards(cardsData);
    }
    setLoading(false);
  }, []);

  const updateAccount = async (accountId: string, newBalance: number) => {
    const { data, error } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', accountId);

    if (!error) {
      setAccounts(prevAccounts =>
        prevAccounts.map(account =>
          account.id === accountId
            ? { ...account, balance: newBalance, available: newBalance - (account.creditLimit || 0) }
            : account
        )
      );
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'reference' | 'created_at' | 'account_id'> & { account_id: string }): Promise<Transaction | null> => {
    const newTransaction = {
      ...transaction,
      reference: `TXN${Date.now()}`,
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([newTransaction])
      .select()
      .single();

    if (data) {
      setTransactions(prev => [data, ...prev]);
      // Update account balance
      const account = accounts.find(acc => acc.id === transaction.account_id);
      if (account) {
        const newBalance = transaction.type === 'credit'
          ? account.balance + transaction.amount
          : account.balance - transaction.amount;
        await updateAccount(account.id, newBalance);
      }
      return data;
    }
    return null;
  };

  const addCreditCard = async (card: Omit<CreditCard, 'id' | 'number' | 'available' | 'issuedDate' | 'balance' | 'user_id'>): Promise<CreditCard | null> => {
    if (!user) throw new Error('User not authenticated');

    const newCardNumber = `•••• ${Math.floor(1000 + Math.random() * 9000)}`;
    const cardToInsert = {
        ...card,
        user_id: user.id,
        number: newCardNumber,
        balance: 0,
        available: card.creditLimit,
        issuedDate: new Date().toISOString(),
    };

    // This should be a single transaction in a real app
    const { data: newCard, error: cardError } = await supabase
        .from('credit_cards')
        .insert(cardToInsert)
        .select()
        .single();

    if (cardError) {
      console.error('Error adding credit card:', cardError);
      return null;
    }

    const { data: newAccount, error: accountError } = await supabase
        .from('accounts')
        .insert({
            user_id: user.id,
            name: `${card.type} Credit Card`,
            number: newCard.number,
            type: 'Credit Card',
            balance: card.creditLimit,
            credit_limit: card.creditLimit,
        })
        .select()
        .single();

    if (accountError) {
        console.error('Error adding account for credit card:', accountError);
        // Optionally, delete the created credit card entry
        return null;
    }

    // For client state, ensure available field reflects remaining credit
    setCreditCards(prev => [newCard, ...prev]);
    setAccounts(prev => [...prev, { ...newAccount, available: newAccount.balance - (newAccount.credit_limit || 0) }]);

    return newCard;
  };

  const addFixedDeposit = async (fd: Omit<FixedDeposit, 'id' | 'fdNumber' | 'status' | 'user_id'>): Promise<FixedDeposit | null> => {
    if (!user) throw new Error('User not authenticated');

    const fdToInsert = {
        ...fd,
        user_id: user.id,
        fdNumber: `FD${Date.now().toString().slice(-6)}`,
        status: 'active' as const,
    };

    const { data: newFD, error } = await supabase
        .from('fixed_deposits')
        .insert(fdToInsert)
        .select()
        .single();

    if (error) {
      console.error('Error adding fixed deposit:', error);
      return null;
    }

    setFixedDeposits(prev => [newFD, ...prev]);

    // Add a transaction for the FD creation
    const sourceAccount = accounts.find(acc => acc.number === fd.accountNumber);
    if (sourceAccount) {
        await addTransaction({
            account_id: sourceAccount.id,
            account: fd.accountNumber,
            type: 'debit',
            amount: fd.amount,
            description: `Fixed Deposit - ${newFD.fdNumber}`,
            date: new Date().toISOString(),
            status: 'completed',
            category: 'Fixed Deposit',
        });
    }

    return newFD;
  };

  const getAccountById = (id: string) => {
    return accounts.find(account => account.id === id);
  };

  const getFixedDepositById = (id: string) => {
    return fixedDeposits.find(fd => fd.id === id);
  };

  // This logic should ideally be handled by a backend process or a database trigger.
  // For now, we'll keep it on the client side.
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
        user,
        loading,
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
        refreshData, // <-- add this
      }}
    >
      {children}
    </BankingContext.Provider>
  );
};
