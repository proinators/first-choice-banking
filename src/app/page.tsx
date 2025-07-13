"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from 'react-simple-captcha';

// Hardcoded user data, to fetch from database
const users = [
  { email: 'john.doe@example.com', password: 'password123', name: 'John Doe', accountNumber: '1234567890' },
  { email: 'jane.smith@example.com', password: 'securepass', name: 'Jane Smith', accountNumber: '0987654321' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [error, setError] = useState('');

  const captchaRef = useRef(null);

  useEffect(() => {
    // Initialize CAPTCHA
    loadCaptchaEnginge(6, 'white', 'black');
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Check if email is valid
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
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
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // In a real app, you would set an auth token here
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/dashboard');
    } else {
      setError('Invalid email or password');
      loadCaptchaEnginge(6, 'white', 'black'); // Reload CAPTCHA on failed login
      setCaptchaText('');
    }
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
                <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-1">
                  Email Address
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
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="captcha" className="block text-sm font-medium text-blue-100">
                    CAPTCHA Verification
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      loadCaptchaEnginge(6, 'white', '#031d44');
                      setCaptchaText('');
                    }}
                    className="text-xs text-[#66c3ff] hover:text-[#99d6ff] flex items-center"
                    aria-label="Reload CAPTCHA"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-white p-2 rounded">
                      <LoadCanvasTemplate reloadText="" />
                    </div>
                  </div>
                  
                  <input
                    id="captcha"
                    name="captcha"
                    type="text"
                    required
                    value={captchaText}
                    onChange={(e) => setCaptchaText(e.target.value)}
                    className="appearance-none block w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent sm:text-sm"
                    placeholder="Type the text above"
                    autoComplete="off"
                    aria-label="CAPTCHA verification"
                  />
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
                  <Link
                    href="/forgot-password"
                    className="font-medium text-[#66c3ff] hover:text-[#99d6ff]"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>


              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[#031d44] bg-[#66c3ff] hover:bg-[#4ab4ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66c3ff] transition-colors"
                >
                  Sign in
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#031d44] text-blue-200">Don't have an account?</span>
                </div>
              </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => alert('Account creation functionality coming soon!')}
                className="w-full flex justify-center py-2.5 px-4 border border-white/20 rounded-lg text-sm font-medium text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66c3ff] transition-colors"
              >
                Open a new account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
