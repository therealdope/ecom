'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Loader from '@/components/shared/Loader';

export default function UserDashboard() {
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/signin' });
  };

  if (status === 'loading') {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Welcome, {session?.user?.name}!</h2>
            <p className="text-gray-600">Email: {session?.user?.email}</p>
          </div>
          {/* Add more dashboard content here */}
        </div>
      </div>
        <button>
          <Link href="/user/test">Go to Home</Link>
        </button>
    </div>
  );
}
