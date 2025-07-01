// app/support/page.js
'use client';

import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import UserDashboardLayout from '@/components/user/layout/UserDashboardLayout';

export default function SupportPage() {
  return (
    <UserDashboardLayout>
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">Customer Support</h1>

      <p className="text-gray-700 mb-6">
        We&lsquo;re here to help! Choose a support method or send us a message below.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="flex items-center gap-4 bg-white shadow p-4 rounded-lg">
          <PhoneIcon className="w-6 h-6 text-indigo-600" />
          <div>
            <p className="font-semibold">Call Us</p>
            <p className="text-sm text-gray-600">+91 9876543210 (Mon–Sat, 9am–6pm)</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white shadow p-4 rounded-lg">
          <EnvelopeIcon className="w-6 h-6 text-indigo-600" />
          <div>
            <p className="font-semibold">Email Support</p>
            <p className="text-sm text-gray-600">support@ecom.com</p>
          </div>
        </div>
      </div>

      <form className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Your Email</label>
          <input
            type="email"
            className="mt-1 w-full p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            rows={4}
            className="mt-1 w-full p-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="How can we help you?"
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition"
        >
          Send Message
        </button>
      </form>
      
    </div>
    </UserDashboardLayout>
  );
}
