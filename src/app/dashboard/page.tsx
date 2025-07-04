'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowPathIcon, 
  ArrowUpTrayIcon, 
  ArrowDownTrayIcon, 
  CurrencyDollarIcon, 
  CreditCardIcon, 
  DocumentTextIcon, 
  ArrowRightCircleIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useBanking } from '@/context/BankingContext';
import generateStatement from '@/utils/generateStatement';

// Mock data for fixed deposits
const fixedDeposits = [
  { id: 1, accountNumber: '•••• 1234', amount: 500000.00, maturityDate: '2024-12-31', interestRate: '6.5%' },
  { id: 2, accountNumber: '•••• 5678', amount: 1000000.00, maturityDate: '2025-06-30', interestRate: '7.0%' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { accounts, transactions } = useBanking();
  const [user, setUser] = useState<{name: string, email?: string} | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleDownloadStatement = (accountId: string) => {
    const account = accounts.find(acc => acc.id.toString() === accountId);
    if (account) {
      const accountTransactions = transactions.filter(tx => tx.account === account.number);
      generateStatement(account, accountTransactions, formatCurrency, formatDate);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#031d44] to-[#04395e] p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#031d44] to-[#04395e] text-[#031d44]">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">First<span className="text-[#66c3ff]">Choice</span></h1>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-[#66c3ff] flex items-center justify-center text-[#031d44] font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-white text-sm font-medium">{user.name}</span>
              </button>

              {isMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email || ''}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#1d6172] to-[#04395e] rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Welcome back, {user.name.split(' ')[0]}!</h2>
                <p className="text-blue-100 mt-1">Here's an overview of your accounts</p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-right">
                  <p className="text-sm text-blue-200">Total Balance</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(totalBalance)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <button
              onClick={() => router.push('/transfer')}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-colors group"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-[#66c3ff]/20 text-[#66c3ff] mr-4 group-hover:bg-[#66c3ff]/30 transition-colors">
                  <ArrowUpTrayIcon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-medium text-white">Send Money</h3>
                  <p className="text-sm text-blue-200">Transfer to any bank account</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                if (accounts.length > 0) {
                  handleDownloadStatement(accounts[0].id.toString());
                }
              }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-colors group"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-500/20 text-green-400 mr-4 group-hover:bg-green-500/30 transition-colors">
                  <ArrowDownTrayIcon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-medium text-white">Download Statement</h3>
                  <p className="text-sm text-blue-200">Get your account statement</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/transactions')}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-colors group"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 mr-4 group-hover:bg-purple-500/30 transition-colors">
                  <DocumentTextIcon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-medium text-white">Transactions</h3>
                  <p className="text-sm text-blue-200">View all transactions</p>
                </div>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Accounts Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white">Your Accounts</h2>
                </div>

                <div className="space-y-4">
                  {accounts.length > 0 ? (
                    accounts.map((account) => (
                      <div
                        key={account.id}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-white">{account.name}</h3>
                            <p className="text-sm text-blue-200">•••• {account.number.slice(-4)}</p>
                            <p className="text-2xl font-bold text-white mt-2">
                              {formatCurrency(account.balance || 0)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDownloadStatement(account.id.toString())}
                              className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-full"
                              title="Download Statement"
                            >
                              <DocumentTextIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => router.push(`/transfer?from=${account.id.toString()}`)}
                              className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-full"
                              title="Transfer Money"
                            >
                              <ArrowUpTrayIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-blue-200">No accounts found</p>
                      <button
                        onClick={() => router.push('/open-account')}
                        className="mt-2 px-4 py-2 bg-[#66c3ff] text-[#031d44] rounded-lg font-medium hover:bg-[#4ab4ff] transition-colors"
                      >
                        Open an Account
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fixed Deposits */}
            <div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white">Fixed Deposits</h2>
                </div>

                {fixedDeposits.length > 0 ? (
                  <div className="space-y-4">
                    {fixedDeposits.map((deposit) => (
                      <div
                        key={deposit.id}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-white">Fixed Deposit</h3>
                            <p className="text-sm text-blue-200">{deposit.accountNumber}</p>
                            <p className="text-2xl font-bold text-white mt-2">
                              {formatCurrency(deposit.amount)}
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              <div>
                                <p className="text-xs text-blue-200">Maturity Date</p>
                                <p className="text-sm text-white font-medium">{formatDate(deposit.maturityDate)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-blue-200">Interest Rate</p>
                                <p className="text-sm text-white font-medium">{deposit.interestRate}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-[#1d6172]/20 p-4 rounded-full inline-flex items-center justify-center mb-4">
                      <CurrencyDollarIcon className="h-8 w-8 text-[#66c3ff]" />
                    </div>
                    <h3 className="text-lg font-medium text-white">No Fixed Deposits</h3>
                    <p className="text-sm text-blue-200 mt-1 mb-4">Earn higher interest with a fixed deposit</p>
                    <button
                      onClick={() => router.push('/fixed-deposits/new')}
                      className="px-4 py-2 bg-[#66c3ff] text-[#031d44] rounded-lg font-medium hover:bg-[#4ab4ff] transition-colors"
                    >
                      Open Fixed Deposit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
