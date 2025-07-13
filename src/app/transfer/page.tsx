'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { useBanking } from '@/context/BankingContext';

type TransferMethod = 'NEFT' | 'RTGS' | 'IMPS' | 'UPI';

type TransferDetails = {
  fromAccount: string;
  toAccount: string;
  amount: string;
  recipientName: string;
  recipientAccount: string;
  ifscCode: string;
  transferMethod: TransferMethod;
  remarks: string;
};

export default function TransferPage() {
  const router = useRouter();
  const { accounts, addTransaction } = useBanking();
  const [step, setStep] = useState<number>(1);
  const [transferDetails, setTransferDetails] = useState<TransferDetails>({
    fromAccount: '',
    toAccount: '',
    amount: '',
    recipientName: '',
    recipientAccount: '',
    ifscCode: '',
    transferMethod: 'IMPS',
    remarks: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [transferSuccess, setTransferSuccess] = useState<boolean | null>(null);
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTransferDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (step === 1 && !transferDetails.fromAccount) {
      setError('Please select a source account');
      return;
    }
    if (step === 1 && !transferDetails.amount || parseFloat(transferDetails.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (step === 2 && !transferDetails.recipientAccount) {
      setError('Please enter recipient account number');
      return;
    }
    if (step === 2 && !transferDetails.recipientName) {
      setError('Please enter recipient name');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    } else {
      router.push('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_account_id: transferDetails.fromAccount,
          to_account_number: transferDetails.recipientAccount,
          amount: Number(transferDetails.amount),
          remarks: transferDetails.remarks,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Transfer failed');
      }
      setTransactionRef(data.reference);
      setTransferSuccess(true);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Transfer failed. Please try again.');
      setTransferSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getFromAccount = () => {
    return accounts.find(acc => acc.id === (transferDetails.fromAccount));
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Transfer Details' },
      { number: 2, label: 'Recipient Details' },
      { number: 3, label: 'Review & Pay' },
      { number: 4, label: 'Confirmation' },
    ];

    return (
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -z-10"></div>
        { steps.map((stepItem) => (
          <div key={ stepItem.number } className="flex flex-col items-center z-10">
            <div
              className={ `h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${step > stepItem.number
                  ? 'bg-green-500 text-white'
                  : step === stepItem.number
                    ? 'bg-[#66c3ff] text-[#031d44]'
                    : 'bg-white/20 text-white'
                }` }
            >
              { step > stepItem.number ? <CheckCircleIcon className="h-5 w-5" /> : stepItem.number }
            </div>
            <span className={ `text-xs mt-2 ${step >= stepItem.number ? 'text-white' : 'text-blue-200'
              }` }>
              { stepItem.label }
            </span>
          </div>
        )) }
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="fromAccount" className="block text-sm font-medium text-blue-100 mb-1">
                From Account
              </label>
              <select
                id="fromAccount"
                name="fromAccount"
                value={ transferDetails.fromAccount }
                onChange={ handleInputChange }
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
              >
                <option value="">Select Account</option>
                { accounts.map((account) => (
                  <option key={ account.id } value={ account.id }>
                    { account.name } •••• { account.number.slice(-4) } - { formatCurrency(account.balance || 0) }
                  </option>
                )) }
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
                  value={ transferDetails.amount }
                  onChange={ handleInputChange }
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="transferMethod" className="block text-sm font-medium text-blue-100 mb-1">
                Transfer Method
              </label>
              <select
                id="transferMethod"
                name="transferMethod"
                value={ transferDetails.transferMethod }
                onChange={ handleInputChange }
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
              >
                <option value="IMPS">IMPS (Instant)</option>
                <option value="NEFT">NEFT (1-2 hours)</option>
                <option value="RTGS">RTGS (30 min)</option>
                <option value="UPI">UPI (Instant)</option>
              </select>
            </div>

            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-blue-100 mb-1">
                Remarks (Optional)
              </label>
              <input
                type="text"
                id="remarks"
                name="remarks"
                value={ transferDetails.remarks }
                onChange={ handleInputChange }
                placeholder="Add a note"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="recipientName" className="block text-sm font-medium text-blue-100 mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                value={ transferDetails.recipientName }
                onChange={ handleInputChange }
                placeholder="Enter recipient's full name"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="recipientAccount" className="block text-sm font-medium text-blue-100 mb-1">
                Account Number
              </label>
              <input
                type="text"
                id="recipientAccount"
                name="recipientAccount"
                value={ transferDetails.recipientAccount }
                onChange={ handleInputChange }
                placeholder="Enter account number"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="ifscCode" className="block text-sm font-medium text-blue-100 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                id="ifscCode"
                name="ifscCode"
                value={ transferDetails.ifscCode }
                onChange={ handleInputChange }
                placeholder="Enter IFSC code"
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent"
              />
            </div>
          </div>
        );

      case 3:
        const fromAccount = getFromAccount();
        return (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Transfer Summary</h3>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-blue-200">From Account</span>
                  <span className="text-white text-right">
                    { fromAccount?.name }<br />
                    •••• { fromAccount?.number.toString().slice(-4) }
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-blue-200">To Account</span>
                  <span className="text-white text-right">
                    { transferDetails.recipientName }<br />
                    •••• { transferDetails.recipientAccount.slice(-4) }
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-blue-200">Amount</span>
                  <span className="text-2xl font-bold text-white">
                    { formatCurrency(parseFloat(transferDetails.amount) || 0) }
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-blue-200">Transfer Method</span>
                  <span className="text-white">{ transferDetails.transferMethod }</span>
                </div>

                { transferDetails.remarks && (
                  <div className="flex justify-between">
                    <span className="text-blue-200">Remarks</span>
                    <span className="text-white text-right">{ transferDetails.remarks }</span>
                  </div>
                ) }
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-300">Review your transfer details</h3>
                  <div className="mt-2 text-sm text-yellow-200">
                    <p>Please ensure all details are correct before confirming the transfer.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center py-8">
            { transferSuccess ? (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 mb-4">
                  <CheckCircleIcon className="h-10 w-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Transfer Successful!</h3>
                <p className="text-blue-200 mb-6">Your money has been transferred successfully.</p>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 max-w-md mx-auto text-left space-y-4">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Transaction ID</span>
                    <span className="text-white font-mono">{ transactionRef }</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Amount</span>
                    <span className="text-white font-medium">
                      { formatCurrency(parseFloat(transferDetails.amount) || 0) }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Recipient</span>
                    <span className="text-white text-right">
                      { transferDetails.recipientName }<br />
                      •••• { transferDetails.recipientAccount.slice(-4) }
                    </span>
                  </div>
                </div>
                <div className="mt-8">
                  <button
                    onClick={ () => {
                      // Reset form and go back to dashboard
                      setTransferDetails({
                        fromAccount: '',
                        toAccount: '',
                        amount: '',
                        recipientName: '',
                        recipientAccount: '',
                        ifscCode: '',
                        transferMethod: 'IMPS',
                        remarks: '',
                      });
                      setStep(1);
                      setTransferSuccess(null);
                      setTransactionRef('');
                      router.push('/dashboard');
                    } }
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-[#66c3ff] hover:bg-[#4ab4ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66c3ff]"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-4">
                  <XCircleIcon className="h-10 w-10 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Transfer Failed</h3>
                <p className="text-blue-200 mb-6">
                  { error || 'There was an error processing your transfer. Please try again.' }
                </p>
                <button
                  onClick={ () => setStep(1) }
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-[#66c3ff] hover:bg-[#4ab4ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66c3ff]"
                >
                  Try Again
                </button>
              </>
            ) }
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#031d44] to-[#04395e] text-white">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */ }
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={ handleBack }
            className="flex items-center text-blue-200 hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold">
            { step === 4
              ? transferSuccess ? 'Transfer Complete' : 'Transfer Failed'
              : 'Transfer Money' }
          </h1>
          <div className="w-20"></div> {/* Spacer for alignment */ }
        </div>

        { step < 4 && renderStepIndicator() }

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg">
          { error && step < 4 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-200">{ error }</p>
                </div>
              </div>
            </div>
          ) }

          { renderStepContent() }

          { step < 3 && (
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={ handleNext }
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-[#66c3ff] hover:bg-[#4ab4ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66c3ff]"
              >
                Next
                <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" />
              </button>
            </div>
          ) }

          { step === 3 && (
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={ handleBack }
                className="inline-flex items-center px-6 py-3 border border-white/20 text-base font-medium rounded-lg shadow-sm text-white bg-transparent hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66c3ff]"
              >
                <ArrowLeftIcon className="mr-2 -ml-1 h-5 w-5" />
                Back
              </button>
              <button
                type="button"
                onClick={ handleSubmit }
                disabled={ isSubmitting }
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                { isSubmitting ? (
                  <>
                    <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm & Transfer
                    <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" />
                  </>
                ) }
              </button>
            </div>
          ) }
        </div>
      </div>
    </div>
  );
}
