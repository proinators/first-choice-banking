'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { 
  ArrowDownTrayIcon, 
  ArrowLeftIcon, 
  ArrowPathIcon, 
  FunnelIcon, 
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useBanking } from '@/context/BankingContext';

type Transaction = {
  id: string;
  account: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
};

type Account = {
  id: string;
  name: string;
  number: string;
  balance: number;
  type: string;
};

// Simple PDF generation function
const generatePdf = (transactions: Transaction[], formatAmount: (amount: number) => string, formatDisplayDate: (date: string) => string) => {
  const win = window.open('', '_blank');
  if (!win) return;

  let htmlContent = `
    <html>
      <head>
        <title>Transaction History</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            color: #031d44;
          }
          h1 { 
            color: #04395e;
            border-bottom: 2px solid #66c3ff;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #04395e;
          }
          .date {
            color: #6b7280;
            font-size: 14px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          th { 
            background-color: #04395e;
            color: #f7f0f5;
            padding: 12px;
            text-align: left;
            font-weight: 500;
          }
          td { 
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          tr:nth-child(even) { 
            background-color: #f8fafc;
          }
          .credit { color: #10b981; }
          .debit { color: #ef4444; }
          .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            text-transform: capitalize;
          }
          .completed { background-color: #dcfce7; color: #166534; }
          .pending { background-color: #fef9c3; color: #854d0e; }
          .failed { background-color: #fee2e2; color: #991b1b; }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">First<span style="color: #66c3ff;">Choice</span> Bank</div>
          <div class="date">Generated on ${format(new Date(), 'MMM dd, yyyy hh:mm a')}</div>
        </div>
        <h1>Transaction History</h1>
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Description</th>
              <th>Account</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
  `;

  transactions.forEach((transaction) => {
    const formattedDate = formatDisplayDate(transaction.date);
    const amount = formatAmount(transaction.amount);
    const amountClass = transaction.type === 'credit' ? 'credit' : 'debit';
    const sign = transaction.type === 'credit' ? '+' : '-';
    
    htmlContent += `
      <tr>
        <td>${formattedDate}</td>
        <td>${transaction.description}</td>
        <td>•••• ${transaction.account.slice(-4)}</td>
        <td class="${amountClass}">${sign} ${amount}</td>
        <td><span class="status ${transaction.status}">${transaction.status}</span></td>
        <td>${transaction.reference}</td>
      </tr>
    `;
  });

  htmlContent += `
          </tbody>
        </table>
        <div class="footer">
          <p>This is an auto-generated statement. For any discrepancies, please contact customer support.</p>
          <p>© ${new Date().getFullYear()} FirstChoice Bank. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  win.document.write(htmlContent);
  win.document.close();
  
  // Trigger print dialog after a short delay to ensure content is loaded
  setTimeout(() => {
    win.print();
  }, 500);
};

export default function TransactionsPage() {
  const router = useRouter();
  const { transactions: allTransactions, accounts } = useBanking();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Format currency with INR symbol
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM dd, yyyy hh:mm a');
  };

  // Filter transactions based on search criteria
  const filteredTransactions = allTransactions.filter((transaction) => {
    // Filter by search term
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by account
    const matchesAccount = 
      selectedAccount === 'all' || 
      transaction.account === selectedAccount;
    
    // Filter by transaction type
    const matchesType = 
      selectedType === 'all' || 
      (selectedType === 'credit' && transaction.type === 'credit') ||
      (selectedType === 'debit' && transaction.type === 'debit');
    
    // Filter by date range
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(transaction.date) >= new Date(startDate);
    }
    if (endDate) {
      // Set end of day for end date
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && new Date(transaction.date) <= endOfDay;
    }
    
    return matchesSearch && matchesAccount && matchesType && matchesDate;
  });

  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedAccount('all');
    setSelectedType('all');
    setStartDate('');
    setEndDate('');
  };

  // Handle PDF generation
  const handleDownloadPdf = () => {
    generatePdf(filteredTransactions, formatAmount, formatDisplayDate);
  };

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#031d44] to-[#04395e]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#66c3ff] mx-auto"></div>
          <p className="mt-4 text-white">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#031d44] to-[#04395e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold">Transaction History</h1>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
            <button
              onClick={() => generatePdf(filteredTransactions, formatAmount, formatDisplayDate)}
              className="inline-flex items-center px-4 py-2 bg-[#1d6172] border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#1a5463] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66c3ff] transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-blue-200" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-white/20 bg-white/5 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
            />
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="account" className="block text-sm font-medium text-blue-100 mb-1">
                    Account
                  </label>
                  <select
                    id="account"
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
                  >
                    <option value="all">All Accounts</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.number}>
                        {account.name} •••• {account.number.slice(-4)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-blue-100 mb-1">
                    Type
                  </label>
                  <select
                    id="type"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-blue-100 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-blue-100 mb-1">
                    To Date
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
                    />
                    <button
                      onClick={resetFilters}
                      className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Reset filters"
                    >
                      <ArrowPathIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-lg">
          {sortedTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                      Account
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-blue-200 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-blue-200 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">
                        {formatDisplayDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{transaction.description}</div>
                        <div className="text-xs text-blue-200">Ref: {transaction.reference}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-100">
                        •••• {transaction.account.slice(-4)}
                      </td>
                      <td 
                        className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                          transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {transaction.type === 'credit' ? '+' : '-'} {formatAmount(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span 
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === 'completed' 
                              ? 'bg-green-500/10 text-green-400' 
                              : transaction.status === 'pending'
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto h-16 w-16 text-blue-200 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white">No transactions found</h3>
              <p className="mt-1 text-sm text-blue-200">
                {searchTerm || selectedAccount !== 'all' || selectedType !== 'all' || startDate || endDate
                  ? 'Try adjusting your search or filter criteria'
                  : 'Your transactions will appear here'}
              </p>
              {(searchTerm || selectedAccount !== 'all' || selectedType !== 'all' || startDate || endDate) && (
                <button
                  onClick={resetFilters}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#66c3ff] hover:bg-[#4ab4ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66c3ff] transition-colors"
                >
                  <XMarkIcon className="-ml-1 mr-2 h-4 w-4" />
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {sortedTransactions.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-blue-200">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">{Math.min(10, sortedTransactions.length)}</span> of{' '}
              <span className="font-medium">{sortedTransactions.length}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                disabled
                className="px-3 py-2 rounded-lg border border-white/20 text-blue-200 bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button className="px-3 py-2 rounded-lg border border-[#66c3ff] text-white bg-[#66c3ff]/10">
                1
              </button>
              <button className="px-3 py-2 rounded-lg border border-white/20 text-blue-200 hover:bg-white/5">
                2
              </button>
              <button className="px-3 py-2 rounded-lg border border-white/20 text-blue-200 hover:bg-white/5">
                3
              </button>
              <button className="px-3 py-2 rounded-lg border border-white/20 text-blue-200 hover:bg-white/5">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
