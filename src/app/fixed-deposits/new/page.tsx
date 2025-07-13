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

interface FDDetails {
  sourceAccount: string;
  amount: string;
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
const interestRates = {
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
  const { accounts, addFixedDeposit } = useBanking();
  const [user, setUser] = useState<{name: string, email?: string} | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fdNumber, setFdNumber] = useState('');
  const [error, setError] = useState('');

  const [fdDetails, setFdDetails] = useState<FDDetails>({
    sourceAccount: '',
    amount: '',
    tenure: 12,
    interestRate: 6.5,
    interestPayout: 'maturity',
    nominee: '',
    nomineeRelation: '',
    nomineeMobile: '',
    autoRenewal: false,
    prematureClosure: false,
  });

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

  const calculateMaturityAmount = () => {
    const principal = parseFloat(fdDetails.amount) || 0;
    const rate = fdDetails.interestRate / 100;
    const time = fdDetails.tenure / 12;
    
    // Simple interest calculation
    const interest = principal * rate * time;
    return principal + interest;
  };

  const calculateMonthlyInterest = () => {
    const principal = parseFloat(fdDetails.amount) || 0;
    const rate = fdDetails.interestRate / 100;
    const time = fdDetails.tenure / 12;
    
    const interest = principal * rate * time;
    return interest / fdDetails.tenure;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFdDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Update interest rate when tenure changes
    if (name === 'tenure') {
      const tenure = parseInt(value);
      const rate = interestRates[tenure as keyof typeof interestRates] || 6.5;
      setFdDetails(prev => ({
        ...prev,
        tenure,
        interestRate: rate
      }));
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!fdDetails.sourceAccount) {
        setError('Please select a source account');
        return;
      }
      if (!fdDetails.amount || parseFloat(fdDetails.amount) < 10000) {
        setError('Minimum amount required is ₹10,000');
        return;
      }
      const selectedAccount = accounts.find(acc => acc.id.toString() === fdDetails.sourceAccount);
      if (selectedAccount && parseFloat(fdDetails.amount) > selectedAccount.balance) {
        setError('Insufficient balance in selected account');
        return;
      }
    }
    if (step === 2) {
      if (!fdDetails.nominee) {
        setError('Please enter nominee name');
        return;
      }
      if (!fdDetails.nomineeRelation) {
        setError('Please enter nominee relation');
        return;
      }
      if (!fdDetails.nomineeMobile || fdDetails.nomineeMobile.length !== 10) {
        setError('Please enter valid nominee mobile number');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    } else {
      router.push('/fixed-deposits');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Calculate maturity date
      const startDate = new Date();
      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + fdDetails.tenure);

      // Create FD
      const newFD = addFixedDeposit({
        accountNumber: fdDetails.sourceAccount,
        amount: parseFloat(fdDetails.amount),
        maturityDate: maturityDate.toISOString(),
        interestRate: fdDetails.interestRate,
        tenure: fdDetails.tenure,
        startDate: startDate.toISOString(),
        interestPayout: fdDetails.interestPayout,
        nominee: fdDetails.nominee,
      });

      setFdNumber(newFD.fdNumber);
      setSuccess(true);
      setStep(4);
    } catch (err) {
      setError('Failed to create fixed deposit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'FD Details' },
      { number: 2, label: 'Nominee Details' },
      { number: 3, label: 'Review & Confirm' },
      { number: 4, label: 'Success' },
    ];

    return (
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -z-10"></div>
        {steps.map((stepItem) => (
          <div key={stepItem.number} className="flex flex-col items-center z-10">
            <div 
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step > stepItem.number 
                  ? 'bg-green-500 text-white' 
                  : step === stepItem.number 
                    ? 'bg-[#66c3ff] text-[#031d44]' 
                    : 'bg-white/20 text-white'
              }`}
            >
              {step > stepItem.number ? <CheckCircleIcon className="h-5 w-5" /> : stepItem.number}
            </div>
            <span className={`text-xs mt-2 ${
              step >= stepItem.number ? 'text-white' : 'text-blue-200'
            }`}>
              {stepItem.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="sourceAccount" className="block text-sm font-medium text-blue-100 mb-1">
                Source Account
              </label>
              <select
                id="sourceAccount"
                name="sourceAccount"
                value={fdDetails.sourceAccount}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} •••• {account.number.slice(-4)} - {formatCurrency(account.balance || 0)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-blue-100 mb-1">
                Amount (₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-blue-200">₹</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={fdDetails.amount}
                  onChange={handleInputChange}
                  placeholder="10000"
                  min="10000"
                  className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
                />
              </div>
              <p className="text-xs text-blue-200 mt-1">Minimum amount: ₹10,000</p>
            </div>

            <div>
              <label htmlFor="tenure" className="block text-sm font-medium text-blue-100 mb-1">
                Tenure (Months)
              </label>
              <select
                id="tenure"
                name="tenure"
                value={fdDetails.tenure}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
              >
                <option value={3}>3 months - 5.5%</option>
                <option value={6}>6 months - 6.0%</option>
                <option value={9}>9 months - 6.25%</option>
                <option value={12}>12 months - 6.5%</option>
                <option value={15}>15 months - 6.75%</option>
                <option value={18}>18 months - 7.0%</option>
                <option value={21}>21 months - 7.25%</option>
                <option value={24}>24 months - 7.5%</option>
                <option value={36}>36 months - 7.75%</option>
                <option value={48}>48 months - 8.0%</option>
                <option value={60}>60 months - 8.25%</option>
              </select>
            </div>

            <div>
              <label htmlFor="interestPayout" className="block text-sm font-medium text-blue-100 mb-1">
                Interest Payout Frequency
              </label>
              <select
                id="interestPayout"
                name="interestPayout"
                value={fdDetails.interestPayout}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
              >
                <option value="maturity">At Maturity</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            {/* Interest Calculator */}
            <div className="bg-[#1d6172]/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CalculatorIcon className="h-5 w-5 text-[#66c3ff]" />
                <h3 className="text-white font-medium">Interest Calculator</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-blue-200">Interest Rate</p>
                  <p className="text-white font-semibold">{fdDetails.interestRate}%</p>
                </div>
                <div>
                  <p className="text-blue-200">Total Interest</p>
                  <p className="text-white font-semibold">
                    {formatCurrency(calculateMaturityAmount() - parseFloat(fdDetails.amount || '0'))}
                  </p>
                </div>
                <div>
                  <p className="text-blue-200">Maturity Amount</p>
                  <p className="text-white font-semibold">{formatCurrency(calculateMaturityAmount())}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="nominee" className="block text-sm font-medium text-blue-100 mb-1">
                Nominee Name
              </label>
              <input
                type="text"
                id="nominee"
                name="nominee"
                value={fdDetails.nominee}
                onChange={handleInputChange}
                placeholder="Enter nominee name"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="nomineeRelation" className="block text-sm font-medium text-blue-100 mb-1">
                Relation with Nominee
              </label>
              <select
                id="nomineeRelation"
                name="nomineeRelation"
                value={fdDetails.nomineeRelation}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
              >
                <option value="">Select Relation</option>
                <option value="Spouse">Spouse</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="nomineeMobile" className="block text-sm font-medium text-blue-100 mb-1">
                Nominee Mobile Number
              </label>
              <input
                type="tel"
                id="nomineeMobile"
                name="nomineeMobile"
                value={fdDetails.nomineeMobile}
                onChange={handleInputChange}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="autoRenewal"
                  name="autoRenewal"
                  type="checkbox"
                  checked={fdDetails.autoRenewal}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#66c3ff] focus:ring-[#66c3ff] border-white/20 bg-white/5 rounded"
                />
                <label htmlFor="autoRenewal" className="ml-2 block text-sm text-blue-100">
                  Auto-renewal at maturity
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="prematureClosure"
                  name="prematureClosure"
                  type="checkbox"
                  checked={fdDetails.prematureClosure}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#66c3ff] focus:ring-[#66c3ff] border-white/20 bg-white/5 rounded"
                />
                <label htmlFor="prematureClosure" className="ml-2 block text-sm text-blue-100">
                  Allow premature closure
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-[#1d6172]/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Fixed Deposit Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-blue-200">Amount</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(parseFloat(fdDetails.amount))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Tenure</p>
                    <p className="text-white">{fdDetails.tenure} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Interest Rate</p>
                    <p className="text-white">{fdDetails.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Interest Payout</p>
                    <p className="text-white capitalize">{fdDetails.interestPayout}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-blue-200">Total Interest</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(calculateMaturityAmount() - parseFloat(fdDetails.amount))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Maturity Amount</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(calculateMaturityAmount())}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Nominee</p>
                    <p className="text-white">{fdDetails.nominee} ({fdDetails.nomineeRelation})</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-400">Important Information</h4>
                  <ul className="text-xs text-yellow-200 mt-2 space-y-1">
                    <li>• Fixed deposits are locked for the entire tenure</li>
                    <li>• Early withdrawal may attract penalties</li>
                    <li>• Interest rates are subject to change</li>
                    <li>• TDS will be deducted as per applicable rates</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center py-8">
            <div className="bg-green-500/20 p-6 rounded-full inline-flex items-center justify-center mb-6">
              <CheckCircleIcon className="h-12 w-12 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Fixed Deposit Created Successfully!</h3>
            <p className="text-blue-200 mb-6">Your fixed deposit has been created and is now active.</p>
            
            <div className="bg-white/5 rounded-lg p-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-blue-200">FD Number</p>
                <p className="text-2xl font-bold text-white mb-4">{fdNumber}</p>
                <p className="text-sm text-blue-200">Amount</p>
                <p className="text-xl font-semibold text-white">{formatCurrency(parseFloat(fdDetails.amount))}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/fixed-deposits')}
                className="px-6 py-3 bg-[#66c3ff] text-[#031d44] rounded-lg font-medium hover:bg-[#4ab4ff] transition-colors"
              >
                View All FDs
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );

      default:
        return null;
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
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-white">New Fixed Deposit</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {step < 4 && renderStepIndicator()}

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg">
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