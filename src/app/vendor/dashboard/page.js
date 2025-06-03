'use client';

import { useSession } from 'next-auth/react';
import Loader from '@/components/shared/Loader';
import VendorLayout from '@/components/vendor/layout/VendorLayout';

export default function VendorDashboard() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <Loader />;
  }

  return (
    <VendorLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Total Products</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">24</p>
          <p className="mt-1 text-sm text-gray-500">+12% from last month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">36</p>
          <p className="mt-1 text-sm text-gray-500">+8% from last month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">$4,320</p>
          <p className="mt-1 text-sm text-gray-500">+15% from last month</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
        <div className="border border-gray-200 rounded-md  shadow-sm overflow-hidden">
          <div className="max-h-85 overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <tr key={item} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">ORD-{1000 + item}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Customer {item}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-06-{10 + item}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(item * 120).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item % 3 === 0 ? 'bg-green-100 text-green-800' : item % 3 === 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                          {item % 3 === 0 ? 'Completed' : item % 3 === 1 ? 'Pending' : 'Processing'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Welcome, {session?.user?.name || 'Vendor'}! This is your dashboard for managing your shop.</p>
      </div>
    </VendorLayout>
  );
}
