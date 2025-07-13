"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    // Basic email validation
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would make an API call to your backend here
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message || 'Something went wrong');
      
      setMessage('If an account exists with this email, you will receive password reset instructions shortly.');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#031d44] to-[#04395e] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-blue-200">
          Enter your email and we'll send you a link to reset your password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 py-8 px-4 shadow-lg rounded-xl sm:px-10">
          {error && (
            <div className="rounded-md bg-red-500/20 p-4 border border-red-400/30 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-100">{error}</h3>
                </div>
              </div>
            </div>
          )}
          
          {message ? (
            <div className="rounded-md bg-green-500/20 p-4 border border-green-400/30 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-100">{message}</h3>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-1">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent sm:text-sm"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#66c3ff] hover:bg-[#99d6ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66c3ff] transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-blue-200">
                  Remember your password?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[#66c3ff] hover:text-[#99d6ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66c3ff]"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
