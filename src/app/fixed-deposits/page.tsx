'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  FunnelIcon, 
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useBanking } from '@/context/BankingContext';

export default function FixedDepositsPage() {
  const router = useRouter();
  const { fixedDeposits } = useBanking();
  const [user, setUser] = useState<{name: string, email?: string} | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'matured' | 'closed'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500/20 text-blue-400';
      case 'matured':
        return 'bg-green-500/20 text-green-400';
      case 'closed':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <ClockIcon className="h-4 w-4" />;
      case 'matured':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'closed':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const filteredFDs = fixedDeposits.filter(fd => 
    selectedStatus === 'all' || fd.status === selectedStatus
  );

  const totalFDValue = fixedDeposits.reduce((sum, fd) => sum + fd.amount, 0);
  const activeFDs = fixedDeposits.filter(fd => fd.status === 'active');
  const maturedFDs = fixedDeposits.filter(fd => fd.status === 'matured');

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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-white">Fixed Deposits</h1>
            </div>
            <button
              onClick={() => router.push('/fixed-deposits/new')}
              className="px-4 py-2 bg-[#66c3ff] text-[#031d44] rounded-lg font-medium hover:bg-[#4ab4ff] transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New FD</span>
            </button>
          </div>
        </div>
      </header>

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Total FD Value</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(totalFDValue)}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                  <ClockIcon className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Active FDs</p>
                  <p className="text-2xl font-bold text-white">{activeFDs.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
                  <CheckCircleIcon className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Matured FDs</p>
                  <p className="text-2xl font-bold text-white">{maturedFDs.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/20 text-orange-400">
                  <ExclamationTriangleIcon className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-white">Your Fixed Deposits</h2>
                <div className="flex space-x-2">
                  {(['all', 'active', 'matured', 'closed'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedStatus === status
                          ? 'bg-[#66c3ff] text-[#031d44]'
                          : 'bg-white/10 text-blue-200 hover:bg-white/20'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Deposits List */}
          <div className="space-y-4">
            {filteredFDs.length > 0 ? (
              filteredFDs.map((fd) => {
                const maturityDate = new Date(fd.maturityDate);
                const today = new Date();
                const daysToMaturity = Math.ceil((maturityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const isMatured = daysToMaturity <= 0;
                
                return (
                  <div
                    key={fd.id}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-white">{fd.fdNumber}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(fd.status)}`}>
                            {getStatusIcon(fd.status)}
                            {fd.status.charAt(0).toUpperCase() + fd.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-blue-200">Amount</p>
                            <p className="text-xl font-bold text-white">{formatCurrency(fd.amount)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-blue-200">Interest Rate</p>
                            <p className="text-lg font-semibold text-white">{fd.interestRate}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-blue-200">Tenure</p>
                            <p className="text-lg font-semibold text-white">{fd.tenure} months</p>
                          </div>
                          <div>
                            <p className="text-sm text-blue-200">Interest Payout</p>
                            <p className="text-lg font-semibold text-white capitalize">{fd.interestPayout}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-blue-200">Start Date</p>
                            <p className="text-white">{formatDate(fd.startDate)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-blue-200">Maturity Date</p>
                            <p className="text-white">{formatDate(fd.maturityDate)}</p>
                          </div>
                        </div>

                        {!isMatured && daysToMaturity > 0 && (
                          <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-4 w-4 text-blue-400" />
                              <span className="text-sm text-blue-200">
                                {daysToMaturity} days to maturity
                              </span>
                            </div>
                          </div>
                        )}

                        {fd.nominee && (
                          <div className="mt-3">
                            <p className="text-sm text-blue-200">Nominee</p>
                            <p className="text-white">{fd.nominee}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 lg:ml-4">
                        <button
                          onClick={() => router.push(`/fixed-deposits/${fd.id}`)}
                          className="px-4 py-2 bg-[#66c3ff] text-[#031d44] rounded-lg font-medium hover:bg-[#4ab4ff] transition-colors flex items-center justify-center space-x-2"
                        >
                          <ArrowRightCircleIcon className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                        
                        {isMatured && (
                          <button
                            onClick={() => router.push(`/fixed-deposits/${fd.id}/renew`)}
                            className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg font-medium hover:bg-green-500/30 transition-colors flex items-center justify-center space-x-2"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                            <span>Renew</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="bg-[#1d6172]/20 p-6 rounded-full inline-flex items-center justify-center mb-6">
                  <ClockIcon className="h-12 w-12 text-[#66c3ff]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Fixed Deposits Found</h3>
                <p className="text-blue-200 mb-6">
                  {selectedStatus === 'all' 
                    ? "You don't have any fixed deposits yet. Start earning higher interest rates!"
                    : `No ${selectedStatus} fixed deposits found.`
                  }
                </p>
                {selectedStatus === 'all' && (
                  <button
                    onClick={() => router.push('/fixed-deposits/new')}
                    className="px-6 py-3 bg-[#66c3ff] text-[#031d44] rounded-lg font-medium hover:bg-[#4ab4ff] transition-colors"
                  >
                    Open Your First Fixed Deposit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 