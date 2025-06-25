'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeftIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (step === 2) {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (step === 2 && resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, resendTimer]);

  const handleSendOtp = async () => {
    setError('');
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) return setError(data.message || 'Error sending OTP');

    setStep(2);
    setOtp('');
    setResendTimer(60);
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (otp.length !== 6) return setError('Enter complete 6-digit OTP');

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code: otp }),
    });

    const result = await res.json();
    if (result.success) {
      setStep(3);
    } else {
      setError(result.message || 'Invalid OTP');
      setOtp('');
      otpRefs.current[0]?.focus();
    }
  };

  const handleResetPassword = async () => {
    setError('');

    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.message || 'Failed to reset password');
    router.push('/auth/signin');
  };

  const handleOtpChange = (val, i) => {
    if (!/^\d?$/.test(val)) return;
    const otpArr = otp.split('');
    otpArr[i] = val;
    setOtp(otpArr.join('').padEnd(6, ''));
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (e, i) => {
    if (e.key === 'Backspace') {
      if (!otp[i] && i > 0) {
        otpRefs.current[i - 1]?.focus();
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Back Button */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link
          href="/"
          className="inline-flex items-center border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          <span>Back</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-md w-full md:bg-white rounded-xl md:shadow-lg p-8 space-y-8">
          <div className="flex justify-center">
            <Image src="/logo.png" alt="Logo" width={120} height={120} />
          </div>

          <h2 className="text-center text-2xl font-bold text-gray-900">
            Forgot Password
          </h2>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <label className="block text-sm font-medium text-gray-700">
                Enter your registered email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                placeholder="you@example.com"
              />
              <button
                onClick={handleSendOtp}
                className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
              >
                Send OTP
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <label className="block text-sm font-medium text-gray-700">
                Enter the 6-digit OTP sent to your email
              </label>
              <div className="flex justify-between mt-2 gap-2 sm:gap-3">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={otp[i] || ''}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                      className="w-10 sm:w-12 h-12 text-center text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ))}
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  className="text-sm text-indigo-600 font-medium hover:underline"
                  onClick={handleSendOtp}
                  disabled={resendTimer > 0}
                >
                  {resendTimer > 0
                    ? `Resend OTP in ${resendTimer}s`
                    : 'Resend OTP'}
                </button>

                <button
                  onClick={handleVerifyOtp}
                  className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700"
                >
                  Verify
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 pr-10 border border-gray-300 rounded-md"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <label className="block mt-4 text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 pr-10 border border-gray-300 rounded-md"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <button
                onClick={handleResetPassword}
                className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
