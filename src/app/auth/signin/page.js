'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Loader from '@/components/shared/Loader';
import {
  ChevronLeftIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { useToast } from '@/context/ToastContext';

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (status === 'authenticated' || session) {
      const userRole = session?.user?.role || 'USER';
      const redirectPath =
        userRole === 'USER' ? '/user/dashboard' : '/vendor/dashboard';
      router.replace(redirectPath);
    }
  }, [status, session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        ...formData,
        role,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        const cookieExpireDate = new Date();
        cookieExpireDate.setDate(
          cookieExpireDate.getDate() + (rememberMe ? 7 : 1)
        );
        document.cookie = `rememberMe=true; path=/; expires=${cookieExpireDate.toUTCString()}`;

        const redirectPath =
          role === 'USER' ? '/user/dashboard' : '/vendor/dashboard';
        await router.replace(redirectPath);
        showToast({
          title: 'Welcome Back!!',
          description: 'You have been signed in successfully.',
        });
      }
    } catch (error) {
      setError('An error occurred during sign in');
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || status === 'loading') return <Loader />;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Back Button */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link
          href="/"
          className="inline-flex items-center border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-4 py-2 text-indigo-600 hover:text-indigo-800 transition-colors duration-300 font-medium"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          <span>Back</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-md w-full md:bg-white rounded-xl md:shadow-lg p-8 space-y-8">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="E-commerce Logo"
              width={120}
              height={120}
              className="w-auto h-auto"
              priority
            />
          </div>

          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link
                href="/auth/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                create a new account
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-red-400 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.293-10.707a1 1 0 011.414 1.414L10.414 10l1.293 1.293a1 1 0 01-1.414 1.414L9 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L7.586 10 6.293 8.707a1 1 0 011.414-1.414L9 8.586l1.293-1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I want to register as:</label>
              <div className="flex space-x-4">
                <div
                  onClick={() => setRole('USER')}
                  className={`flex-1 py-3 px-4 border rounded-md cursor-pointer transition-all ${role === 'USER' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-gray-300 hover:border-gray-400'}`}
                >
                  <div className="flex items-center justify-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Shopper</span>
                  </div>
                </div>
                <div
                  onClick={() => setRole('VENDOR')}
                  className={`flex-1 py-3 px-4 border rounded-md cursor-pointer transition-all ${role === 'VENDOR' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-gray-300 hover:border-gray-400'}`}
                >
                  <div className="flex items-center justify-center">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="font-medium">Vendor</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-5">
              {/* Email */}
              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <span className="absolute left-3 top-9 text-gray-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              {/* Password with toggle */}
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <span className="absolute left-3 top-9 text-gray-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[35px] text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="/auth/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
