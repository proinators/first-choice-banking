'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CalculatorIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useBanking } from '@/context/BankingContext';
import { Account, FixedDeposit } from '@/types';
import { formatCurrency } from '@/utils/formatters';

interface FDDetails {
  sourceAccount: string; // This will be the account ID
  amount: number;
  tenure: number;
  interestRate: number;
  interestPayout: 'monthly' | 'quarterly' | 'maturity';
  nominee: string;
  nomineeRelation: string;
  nomineeMobile: string;
  autoRenewal: boolean;
  prematureClosure: boolean;
}

// Interest rates based on tenure (mock data)
const interestRates: { [key: number]: number } = {
  3: 5.5,
  6: 6.0,
  9: 6.25,
  12: 6.5,
  15: 6.75,
  18: 7.0,
  21: 7.25,
  24: 7.5,
  36: 7.75,
  48: 8.0,
  60: 8.25
};

export default function NewFixedDepositPage() {
  const router = useRouter();
  const { user, loading, accounts, addFixedDeposit } = useBanking();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fdNumber, setFdNumber] = useState('');
  const [error, setError] = useState('');

  const [fdDetails, setFdDetails] = useState<FDDetails>({
    sourceAccount: '',
    amount: 10000,
    tenure: 12,
    interestRate: 6.5,
    interestPayout: 'maturity',
    nominee: '',
    nomineeRelation: '',
    nomineeMobile: '',
    autoRenewal: false,
    prematureClosure: false,
  });

  const calculateMaturityAmount = () => {
    const principal = fdDetails.amount || 0;
    const rate = fdDetails.interestRate / 100;
    const tenureInYears = fdDetails.tenure / 12;
    return principal * Math.pow(1 + rate, tenureInYears);
  };

  const calculateMonthlyInterest = () => {
    const principal = fdDetails.amount || 0;
    const monthlyRate = fdDetails.interestRate / 100 / 12;
    return principal * monthlyRate;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'tenure') {
      const newTenure = parseInt(value, 10);
      const newInterestRate = interestRates[newTenure] || 6.5;
      setFdDetails(prev => ({ 
        ...prev, 
        tenure: newTenure,
        interestRate: newInterestRate
      }));
    } else {
      setFdDetails(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (name === 'amount' ? parseFloat(value) || 0 : value)
      }));
    }
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!fdDetails.sourceAccount) {
        setError('Please select a source account');
        return;
      }
      if (!fdDetails.amount || fdDetails.amount < 10000) {
        setError('Minimum amount required is ₹10,000');
        return;
      }
      const selectedAccount = accounts.find((acc: Account) => acc.id === fdDetails.sourceAccount);
      if (selectedAccount && fdDetails.amount > selectedAccount.balance) {
        setError('Insufficient balance in selected account');
        return;
      }
    }
    if (step === 2) {
      if (!fdDetails.nominee || !fdDetails.nomineeRelation || !fdDetails.nomineeMobile) {
        setError('Please fill in all nominee details');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a fixed deposit.');
      return;
    }

    const sourceAccount = accounts.find((acc: Account) => acc.id === fdDetails.sourceAccount);
    if (!sourceAccount) {
      setError('Invalid source account selected.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const startDate = new Date();
      const maturityDate = new Date(startDate);
      maturityDate.setMonth(startDate.getMonth() + fdDetails.tenure);

      const fdData: Omit<FixedDeposit, 'id' | 'fdNumber' | 'status' | 'user_id'> = {
        accountNumber: sourceAccount.number,
        amount: fdDetails.amount,
        tenure: fdDetails.tenure,
        interestRate: fdDetails.interestRate,
        startDate: startDate.toISOString(),
        maturityDate: maturityDate.toISOString(),
        interestPayout: fdDetails.interestPayout,
        nominee: fdDetails.nominee,
      };

      const newFd = await addFixedDeposit(fdData);

      if (newFd) {
        setFdNumber(newFd.fdNumber);
        setSuccess(true);
        setStep(4);
      } else {
        setError('Failed to create fixed deposit. Please try again.');
      }
    } catch (err) {
      console.error('Error creating fixed deposit:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#031d44] to-[#04395e] p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Create Fixed Deposit</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="sourceAccount" className="block text-sm font-medium text-blue-200 mb-2">Source Account</label>
                <select
                  id="sourceAccount"
                  name="sourceAccount"
                  value={fdDetails.sourceAccount}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
                >
                  <option value="">Select Account</option>
                  {accounts.map((account: Account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} •••• {account.number.slice(-4)} - {formatCurrency(account.balance || 0)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-blue-200 mb-2">Amount (Min. ₹10,000)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={fdDetails.amount.toString()}
                  onChange={handleInputChange}
                  placeholder="10000"
                  min="10000"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="tenure" className="block text-sm font-medium text-blue-200 mb-2">Tenure (in months)</label>
                <select
                  id="tenure"
                  name="tenure"
                  value={fdDetails.tenure.toString()}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
                >
                  {Object.keys(interestRates).map(t => <option key={t} value={t}>{t} months</option>)}
                </select>
              </div>
              <div className="p-4 bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-200">Interest Rate: <span className="font-bold text-white">{fdDetails.interestRate}% p.a.</span></p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Nominee Details</h2>
            <div className="space-y-6">
              <input type="text" name="nominee" value={fdDetails.nominee} onChange={handleInputChange} placeholder="Nominee Name" className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent" />
              <input type="text" name="nomineeRelation" value={fdDetails.nomineeRelation} onChange={handleInputChange} placeholder="Relation" className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent" />
              <input type="text" name="nomineeMobile" value={fdDetails.nomineeMobile} onChange={handleInputChange} placeholder="Mobile Number" className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent" />
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Confirm Details</h2>
            <div className="space-y-4 p-6 bg-white/5 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Amount</span>
                <span className="font-bold text-white">{formatCurrency(fdDetails.amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Tenure</span>
                <span className="font-bold text-white">{fdDetails.tenure} months</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Interest Rate</span>
                <span className="font-bold text-white">{fdDetails.interestRate}% p.a.</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Maturity Amount</span>
                <span className="font-bold text-white">{formatCurrency(calculateMaturityAmount())}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Nominee</span>
                <span className="font-bold text-white">{fdDetails.nominee}</span>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="text-center py-10">
            <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Fixed Deposit Created!</h2>
            <p className="text-blue-200 mb-4">Your FD #{fdNumber} has been successfully created.</p>
            <button onClick={() => router.push('/dashboard')} className="px-6 py-3 bg-[#66c3ff] text-[#031d44] rounded-lg font-medium hover:bg-[#4ab4ff] transition-colors">Go to Dashboard</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#031d44] to-[#04395e]">
      <main className="container mx-auto px-4 py-8 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
            {error && (
              <div className="rounded-md bg-red-500/20 p-4 border border-red-400/30 mb-6">
                <div className="flex">
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-100">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {step < 4 ? (
              <form onSubmit={handleSubmit}>
                {renderStepContent()}

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg font-medium hover:bg-white/20 transition-colors"
                  >
                    {step === 1 ? 'Cancel' : 'Back'}
                  </button>
                  
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-3 bg-[#66c3ff] text-[#031d44] rounded-lg font-medium hover:bg-[#4ab4ff] transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-3 bg-[#66c3ff] text-[#031d44] rounded-lg font-medium hover:bg-[#4ab4ff] transition-colors ${
                        isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? 'Creating FD...' : 'Create Fixed Deposit'}
                    </button>
                  )}
                </div>
              </form>
            ) : (
              renderStepContent()
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 
