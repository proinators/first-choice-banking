"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { useBanking } from '@/context/BankingContext';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function OpenAccountPage() {
  const router = useRouter();
  const { user } = useBanking();
  const [name, setName] = useState('Savings Account');
  const [type, setType] = useState('Savings');
  const [initialDeposit, setInitialDeposit] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in');
      return;
    }
    setError('');
    setSubmitting(true);

    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        name,
        type,
        initialDeposit: Number(initialDeposit),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to create account');
      setSubmitting(false);
      return;
    }

    // success – go back to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#031d44] to-[#04395e] text-white">
      <header className="p-4 sm:p-6 flex items-center">
        <button onClick={() => router.back()} className="mr-4 p-2 bg-white/10 rounded-full hover:bg-white/20">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold">Open New Account</h1>
      </header>

      <main className="p-4 sm:p-6 max-w-lg mx-auto">
        {error && (
          <div className="mb-4 bg-red-500/20 p-3 rounded border border-red-400/30">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur">
          <div>
            <label className="block text-sm mb-1">Account Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded p-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Account Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded p-3"
            >
              <option>Savings</option>
              <option>Current</option>
              <option>Salary</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Initial Deposit (optional)</label>
            <input
              type="number"
              value={initialDeposit}
              min="0"
              onChange={(e) => setInitialDeposit(Number(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded p-3"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#66c3ff] text-[#031d44] rounded-lg font-medium hover:bg-[#4ab4ff] disabled:opacity-50"
          >
            {isSubmitting ? 'Opening...' : 'Open Account'}
          </button>
        </form>
      </main>
    </div>
  );
}
