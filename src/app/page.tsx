"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha';

// Hardcoded user data
const users = [
  { accountNumber: '1234567890', password: 'password123', name: 'John Doe' },
  { accountNumber: '0987654321', password: 'securepass', name: 'Jane Smith' },
];

export default function LoginPage() {
  const router = useRouter();
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const captchaRef = useRef(null);

  useEffect(() => {
    // Initialize CAPTCHA
    loadCaptchaEnginge(6, 'white', 'black');
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!accountNumber || !password) {
      setError('Please enter both account number and password');
      return;
    }

    // Check if account number is 10 digits
    if (!/^\d{10}$/.test(accountNumber)) {
      setError('Account number must be 10 digits');
      return;
    }

    // Validate CAPTCHA
    if (!validateCaptcha(captchaText)) {
      setError('Invalid CAPTCHA. Please try again.');
      loadCaptchaEnginge(6, 'white', 'black'); // Reload CAPTCHA
      setCaptchaText('');
      return;
    }

    // Check credentials
    const user = users.find(
      (u) => u.accountNumber === accountNumber && u.password === password
    );

    if (user) {
      // In a real app, you would set an auth token here
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/dashboard');
    } else {
      setError('Invalid account number or password');
      loadCaptchaEnginge(6, 'white', 'black'); // Reload CAPTCHA on failed login
      setCaptchaText('');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotMessage('Please enter your email address');
      return;
    }
    // In a real app, you would send a password reset email here
    setForgotMessage('If an account exists with this email, you will receive password reset instructions.');
    setForgotEmail('');
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotMessage('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#031d44] to-[#04395e] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          First Choice Banking
        </h2>
        <p className="mt-2 text-center text-sm text-blue-200">
          Please sign in to your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 py-8 px-4 shadow-lg rounded-xl sm:px-10">
          {!showForgotPassword ? (
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="rounded-md bg-red-500/20 p-4 border border-red-400/30">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-100">{error}</h3>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-blue-100 mb-1">
                  Account Number
                </label>
                <div className="mt-1">
                  <input
                    id="accountNumber"
                    name="accountNumber"
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={10}
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="appearance-none block w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent sm:text-sm"
                    placeholder="Enter 10-digit account number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-1">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent sm:text-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* CAPTCHA Section */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="captcha" className="block text-sm font-medium text-blue-100">
                    Enter CAPTCHA
                  </label>
                  <button
                    type="button"
                    onClick={() => loadCaptchaEnginge(6, '#66c3ff', '#031d44')}
                    className="text-xs text-[#66c3ff] hover:text-[#99d6ff]"
                  >
                    Reload CAPTCHA
                  </button>
                </div>
                <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 py-6 px-4 shadow-lg rounded-xl sm:px-10">
                  <div className="flex-1">
                    <input
                      id="captcha"
                      name="captcha"
                      type="text"
                      required
                      value={captchaText}
                      onChange={(e) => setCaptchaText(e.target.value)}
                      className="appearance-none block w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent sm:text-sm"
                      placeholder="Enter CAPTCHA"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    <LoadCanvasTemplate reloadText="" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#66c3ff] focus:ring-[#66c3ff] border-white/20 bg-white/5 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-blue-100">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="font-medium text-[#66c3ff] hover:text-[#99d6ff]"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[#031d44] bg-[#66c3ff] hover:bg-[#4ab4ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66c3ff] transition-colors"
                >
                  Sign in
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
              <p className="text-sm text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              {forgotMessage && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{forgotMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form className="space-y-6" onSubmit={handleForgotPassword}>
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
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="appearance-none block w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent sm:text-sm"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full flex justify-center py-3 px-4 border border-white/20 rounded-lg shadow-sm text-sm font-medium text-white bg-transparent hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66c3ff] transition-colors"
                  >
                    Back to login
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[#031d44] bg-[#66c3ff] hover:bg-[#4ab4ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66c3ff] transition-colors"
                >
                  Send Reset Link
                </button>
              </form>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="#"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Open a new account
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
