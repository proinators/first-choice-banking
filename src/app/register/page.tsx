'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (user) {
        // Persist basic profile info in the public.users table so that
        // the rest of the app can join on user_id without relying on a DB trigger.
        // If the row already exists (e.g. because a trigger INSERTed it) we ignore the error.
        const { error: profileErr } = await supabase.from('users').insert({
          id: user.id, // use auth uid as PK
          email,
          full_name: fullName,
        });
        if (profileErr && profileErr.code !== '23505' /* unique violation */) {
          setError(profileErr.message);
          return;
        }
        router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#031d44] to-[#04395e] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Create a new account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 py-8 px-4 shadow-lg rounded-xl sm:px-10">
            <form className="space-y-6" onSubmit={handleRegister}>
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
                <label htmlFor="fullName" className="block text-sm font-medium text-blue-100 mb-1">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="appearance-none block w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

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
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#66c3ff] focus:border-transparent sm:text-sm"
                    placeholder="Create a password"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-[#031d44] bg-[#66c3ff] hover:bg-[#4ab4ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66c3ff] transition-colors"
                >
                  Register
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-blue-200">
                    Already have an account?{' '}
                    <Link href="/" className="font-medium text-[#66c3ff] hover:text-[#99d6ff]">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
