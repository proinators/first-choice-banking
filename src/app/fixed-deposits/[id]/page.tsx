'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useBanking } from '@/context/BankingContext';

export default function FixedDepositDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { getFixedDepositById } = useBanking();
  const [user, setUser] = useState<{name: string, email?: string} | null>(null);
  const [fd, setFd] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));

    // Get the FD details
    const fdId = params.id as string;
    const fixedDeposit = getFixedDepositById(fdId);
    
    if (!fixedDeposit) {
      router.push('/fixed-deposits');
      return;
    }

    setFd(fixedDeposit);
  }, [params.id, router, getFixedDepositById]);

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
      month: 'long',
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

  const calculateMaturityAmount = () => {
    if (!fd) return 0;
    const principal = fd.amount;
    const rate = fd.interestRate / 100;
    const time = fd.tenure / 12;
    const interest = principal * rate * time;
    return principal + interest;
  };

  const calculateInterestEarned = () => {
    if (!fd) return 0;
    const principal = fd.amount;
    const rate = fd.interestRate / 100;
    const time = fd.tenure / 12;
    return principal * rate * time;
  };

  const getDaysToMaturity = () => {
    if (!fd) return 0;
    const maturityDate = new Date(fd.maturityDate);
    const today = new Date();
    return Math.ceil((maturityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (!user || !fd) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#031d44] to-[#04395e] p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  const daysToMaturity = getDaysToMaturity();
  const isMatured = daysToMaturity <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#031d44] to-[#04395e] text-[#031d44]">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/fixed-deposits')}
                className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-white">Fixed Deposit Details</h1>
            </div>
            <div className="flex space-x-2">
              {isMatured && (
                <button
                  onClick={() => router.push(`/fixed-deposits/${fd.id}/renew`)}
                  className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg font-medium hover:bg-green-500/30 transition-colors flex items-center space-x-2"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Renew</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* FD Header */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">{fd.fdNumber}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(fd.status)}`}>
                    {getStatusIcon(fd.status)}
                    {fd.status.charAt(0).toUpperCase() + fd.status.slice(1)}
                  </span>
                </div>
                <p className="text-blue-200">Fixed Deposit Account</p>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-sm text-blue-200">Principal Amount</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(fd.amount)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FD Details */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Fixed Deposit Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-blue-200">Account Number</p>
                      <p className="text-white font-semibold">{fd.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">Interest Rate</p>
                      <p className="text-white font-semibold">{fd.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">Tenure</p>
                      <p className="text-white font-semibold">{fd.tenure} months</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">Interest Payout</p>
                      <p className="text-white font-semibold capitalize">{fd.interestPayout}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-blue-200">Start Date</p>
                      <p className="text-white font-semibold">{formatDate(fd.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">Maturity Date</p>
                      <p className="text-white font-semibold">{formatDate(fd.maturityDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">FD Number</p>
                      <p className="text-white font-semibold">{fd.fdNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-200">Status</p>
                      <p className="text-white font-semibold capitalize">{fd.status}</p>
                    </div>
                  </div>
                </div>

                {fd.nominee && (
                  <div className="mt-6 p-4 bg-[#1d6172]/20 rounded-lg">
                    <h4 className="text-lg font-semibold text-white mb-3">Nominee Information</h4>
                    <p className="text-white">{fd.nominee}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Calculations */}
            <div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Calculations</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-blue-200">Principal Amount</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(fd.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Interest Earned</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(calculateInterestEarned())}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Maturity Amount</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(calculateMaturityAmount())}</p>
                  </div>
                </div>

                {!isMatured && daysToMaturity > 0 && (
                  <div className="mt-6 p-4 bg-blue-500/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ClockIcon className="h-5 w-5 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Time to Maturity</span>
                    </div>
                    <p className="text-lg font-bold text-white">{daysToMaturity} days</p>
                  </div>
                )}

                {isMatured && (
                  <div className="mt-6 p-4 bg-green-500/10 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                      <span className="text-sm font-medium text-green-400">Matured</span>
                    </div>
                    <p className="text-sm text-green-200">This FD has matured and is ready for renewal or withdrawal</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/fixed-deposits')}
              className="px-6 py-3 bg-[#66c3ff] text-[#031d44] rounded-lg font-medium hover:bg-[#4ab4ff] transition-colors"
            >
              Back to All FDs
            </button>
            {isMatured && (
              <button
                onClick={() => router.push(`/fixed-deposits/${fd.id}/renew`)}
                className="px-6 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg font-medium hover:bg-green-500/30 transition-colors"
              >
                Renew Fixed Deposit
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 