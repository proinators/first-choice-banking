'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CalculatorIcon,
  InformationCircleIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useBanking } from '@/context/BankingContext';

interface RenewalDetails {
  newTenure: number;
  newInterestRate: number;
  newInterestPayout: 'monthly' | 'quarterly' | 'maturity';
  autoRenewal: boolean;
  prematureClosure: boolean;
  nominee: string;
  nomineeRelation: string;
  nomineeMobile: string;
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

export default function RenewFixedDepositPage() {
  const router = useRouter();
  const params = useParams();
  const { fixedDeposits, getFixedDepositById, addFixedDeposit } = useBanking();
  const [user, setUser] = useState<{name: string, email?: string} | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newFdNumber, setNewFdNumber] = useState('');
  const [error, setError] = useState('');
  const [originalFD, setOriginalFD] = useState<any>(null);

  const [renewalDetails, setRenewalDetails] = useState<RenewalDetails>({
    newTenure: 12,
    newInterestRate: 6.5,
    newInterestPayout: 'maturity',
    autoRenewal: false,
    prematureClosure: false,
    nominee: '',
    nomineeRelation: '',
    nomineeMobile: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));

    // Get the original FD details
    const fdId = params.id as string;
    const fd = getFixedDepositById(fdId);
    
    if (!fd) {
      router.push('/fixed-deposits');
      return;
    }

    if (fd.status !== 'matured') {
      router.push('/fixed-deposits');
      return;
    }

    setOriginalFD(fd);
    
    // Pre-fill nominee details from original FD
    setRenewalDetails(prev => ({
      ...prev,
      nominee: fd.nominee || '',
      nomineeRelation: 'Spouse', // Default value
      nomineeMobile: '',
    }));
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
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateMaturityAmount = () => {
    if (!originalFD) return 0;
    
    // Calculate maturity amount from original FD
    const principal = originalFD.amount;
    const rate = originalFD.interestRate / 100;
    const time = originalFD.tenure / 12;
    const interest = principal * rate * time;
    const maturityAmount = principal + interest;
    
    // Calculate new interest on maturity amount
    const newRate = renewalDetails.newInterestRate / 100;
    const newTime = renewalDetails.newTenure / 12;
    const newInterest = maturityAmount * newRate * newTime;
    
    return maturityAmount + newInterest;
  };

  const calculateNewInterest = () => {
    if (!originalFD) return 0;
    
    // Calculate maturity amount from original FD
    const principal = originalFD.amount;
    const rate = originalFD.interestRate / 100;
    const time = originalFD.tenure / 12;
    const interest = principal * rate * time;
    const maturityAmount = principal + interest;
    
    // Calculate new interest on maturity amount
    const newRate = renewalDetails.newInterestRate / 100;
    const newTime = renewalDetails.newTenure / 12;
    const newInterest = maturityAmount * newRate * newTime;
    
    return newInterest;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setRenewalDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Update interest rate when tenure changes
    if (name === 'newTenure') {
      const tenure = parseInt(value);
      const rate = interestRates[tenure as keyof typeof interestRates] || 6.5;
      setRenewalDetails(prev => ({
        ...prev,
        newTenure: tenure,
        newInterestRate: rate
      }));
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!renewalDetails.nominee) {
        setError('Please enter nominee name');
        return;
      }
      if (!renewalDetails.nomineeRelation) {
        setError('Please enter nominee relation');
        return;
      }
      if (!renewalDetails.nomineeMobile || renewalDetails.nomineeMobile.length !== 10) {
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
      if (!originalFD) {
        throw new Error('Original FD not found');
      }

      // Calculate maturity amount from original FD
      const principal = originalFD.amount;
      const rate = originalFD.interestRate / 100;
      const time = originalFD.tenure / 12;
      const interest = principal * rate * time;
      const maturityAmount = principal + interest;

      // Calculate new maturity date
      const startDate = new Date();
      const maturityDate = new Date();
      maturityDate.setMonth(maturityDate.getMonth() + renewalDetails.newTenure);

      // Create new FD with maturity amount as principal
      const newFD = await addFixedDeposit({
        accountNumber: originalFD.accountNumber,
        amount: maturityAmount,
        maturityDate: maturityDate.toISOString(),
        interestRate: renewalDetails.newInterestRate,
        tenure: renewalDetails.newTenure,
        startDate: startDate.toISOString(),
        interestPayout: renewalDetails.newInterestPayout,
        nominee: renewalDetails.nominee,

      });

      setNewFdNumber(newFD?.fdNumber || '');
      setSuccess(true);
      setStep(4);
    } catch (err) {
      setError('Failed to renew fixed deposit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Nominee Details' },
      { number: 2, label: 'New Terms' },
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
    if (!originalFD) return null;

    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-[#1d6172]/20 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Original Fixed Deposit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-200">FD Number</p>
                  <p className="text-white font-semibold">{originalFD.fdNumber}</p>
                </div>
                <div>
                  <p className="text-blue-200">Original Amount</p>
                  <p className="text-white font-semibold">{formatCurrency(originalFD.amount)}</p>
                </div>
                <div>
                  <p className="text-blue-200">Interest Rate</p>
                  <p className="text-white font-semibold">{originalFD.interestRate}%</p>
                </div>
                <div>
                  <p className="text-blue-200">Maturity Amount</p>
                  <p className="text-white font-semibold">
                    {formatCurrency(originalFD.amount + (originalFD.amount * originalFD.interestRate / 100 * originalFD.tenure / 12))}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="nominee" className="block text-sm font-medium text-blue-100 mb-1">
                Nominee Name
              </label>
              <input
                type="text"
                id="nominee"
                name="nominee"
                value={renewalDetails.nominee}
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
                value={renewalDetails.nomineeRelation}
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
                value={renewalDetails.nomineeMobile}
                onChange={handleInputChange}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="newTenure" className="block text-sm font-medium text-blue-100 mb-1">
                New Tenure (Months)
              </label>
              <select
                id="newTenure"
                name="newTenure"
                value={renewalDetails.newTenure}
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
              <label htmlFor="newInterestPayout" className="block text-sm font-medium text-blue-100 mb-1">
                Interest Payout Frequency
              </label>
              <select
                id="newInterestPayout"
                name="newInterestPayout"
                value={renewalDetails.newInterestPayout}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
              >
                <option value="maturity">At Maturity</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="autoRenewal"
                  name="autoRenewal"
                  type="checkbox"
                  checked={renewalDetails.autoRenewal}
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
                  checked={renewalDetails.prematureClosure}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#66c3ff] focus:ring-[#66c3ff] border-white/20 bg-white/5 rounded"
                />
                <label htmlFor="prematureClosure" className="ml-2 block text-sm text-blue-100">
                  Allow premature closure
                </label>
              </div>
            </div>

            {/* Renewal Calculator */}
            <div className="bg-[#1d6172]/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CalculatorIcon className="h-5 w-5 text-[#66c3ff]" />
                <h3 className="text-white font-medium">Renewal Calculator</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-200">Renewal Amount</p>
                  <p className="text-white font-semibold">
                    {formatCurrency(originalFD.amount + (originalFD.amount * originalFD.interestRate / 100 * originalFD.tenure / 12))}
                  </p>
                </div>
                <div>
                  <p className="text-blue-200">New Interest Rate</p>
                  <p className="text-white font-semibold">{renewalDetails.newInterestRate}%</p>
                </div>
                <div>
                  <p className="text-blue-200">New Interest Earned</p>
                  <p className="text-white font-semibold">
                    {formatCurrency(calculateNewInterest())}
                  </p>
                </div>
                <div>
                  <p className="text-blue-200">Final Maturity Amount</p>
                  <p className="text-white font-semibold">{formatCurrency(calculateMaturityAmount())}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-[#1d6172]/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Renewal Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-blue-200">Original FD Number</p>
                    <p className="text-white font-semibold">{originalFD.fdNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Renewal Amount</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(originalFD.amount + (originalFD.amount * originalFD.interestRate / 100 * originalFD.tenure / 12))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">New Tenure</p>
                    <p className="text-white">{renewalDetails.newTenure} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">New Interest Rate</p>
                    <p className="text-white">{renewalDetails.newInterestRate}%</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-blue-200">New Interest Payout</p>
                    <p className="text-white capitalize">{renewalDetails.newInterestPayout}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">New Interest Earned</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(calculateNewInterest())}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Final Maturity Amount</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(calculateMaturityAmount())}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Nominee</p>
                    <p className="text-white">{renewalDetails.nominee} ({renewalDetails.nomineeRelation})</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-400">Renewal Information</h4>
                  <ul className="text-xs text-yellow-200 mt-2 space-y-1">
                    <li>• The original FD will be closed and a new FD will be created</li>
                    <li>• Maturity amount from original FD will be the principal for new FD</li>
                    <li>• New FD will have fresh terms and conditions</li>
                    <li>• Interest rates are subject to current market rates</li>
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
            <h3 className="text-2xl font-bold text-white mb-2">Fixed Deposit Renewed Successfully!</h3>
            <p className="text-blue-200 mb-6">Your fixed deposit has been renewed with new terms.</p>
            
            <div className="bg-white/5 rounded-lg p-6 mb-6">
              <div className="text-center">
                <p className="text-sm text-blue-200">New FD Number</p>
                <p className="text-2xl font-bold text-white mb-4">{newFdNumber}</p>
                <p className="text-sm text-blue-200">Renewal Amount</p>
                <p className="text-xl font-semibold text-white">
                  {formatCurrency(originalFD.amount + (originalFD.amount * originalFD.interestRate / 100 * originalFD.tenure / 12))}
                </p>
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

  if (!user || !originalFD) {
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
              <h1 className="text-xl font-semibold text-white">Renew Fixed Deposit</h1>
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
                      {isSubmitting ? 'Renewing FD...' : 'Renew Fixed Deposit'}
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