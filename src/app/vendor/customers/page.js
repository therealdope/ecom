'use client';
import { useEffect, useState } from 'react';
import VendorLayout from '@/components/vendor/layout/VendorLayout';
import { format } from 'date-fns';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function VendorCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [copiedEmail, setCopiedEmail] = useState(null);

  useEffect(() => {
    fetch('/api/vendor/customers')
      .then((res) => res.json())
      .then((data) => setCustomers(data.customers || []));
  }, []);

  const handleCopy = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 1500);
  };

  return (
    <VendorLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-6">
          Customers Overview
        </h2>

        {customers.length === 0 ? (
          <p className="text-gray-500">No customers yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow border border-indigo-200/50 bg-indigo-100/20 backdrop-blur-md">
            <table className="min-w-full divide-y divide-indigo-200">
              <thead className="bg-indigo-200/30 text-indigo-800 text-sm font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Total Orders</th>
                  <th className="px-4 py-3 text-left">Total Paid</th>
                  <th className="px-4 py-3 text-left">Joined On</th>
                  <th className="px-4 py-3 text-left">Last Ordered</th>
                  <th className="px-4 py-3 text-left">Email</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {customers.map((c, idx) => (
                  <tr key={c.userId} className="hover:bg-indigo-100/30">
                    <td className="px-4 py-3">
                      <span className="group relative cursor-help">
                        {c.name}
                        <span className="hidden group-hover:block absolute bg-white border rounded px-2 py-1 text-xs shadow -top-8">
                          {c.name}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">{c.totalOrders}</td>
                    <td className="px-4 py-3">₹{c.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {format(new Date(c.joinedOn), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      {c.lastOrdered
                        ? format(new Date(c.lastOrdered), 'dd MMM yyyy')
                        : '-'}
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <span>{c.email.slice(0, 12)}...</span>
                      <button
                        onClick={() => handleCopy(c.email)}
                        className="text-indigo-600 hover:text-indigo-800"
                        title="Copy Email"
                      >
                        {copiedEmail === c.email ? (
                          <CheckIcon className="w-4 h-4 text-green-600" />
                        ) : (
                          <ClipboardIcon className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
