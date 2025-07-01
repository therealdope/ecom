'use client';
import { useEffect, useState } from 'react';
import VendorLayout from '@/components/vendor/layout/VendorLayout';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function VendorPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/vendor/payments')
      .then((res) => res.json())
      .then((data) => {
        setPayments(data.payments || []);
        setLoading(false);
      });
  }, []);

  const handleCopy = (orderId) => {
    navigator.clipboard.writeText(orderId);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <VendorLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-6">Received Payments</h2>

        {payments.length === 0 ? (
          <p className="text-gray-500 text-center py-12">{loading ? 'Loading...' : 'No payment history yet.'}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow border border-indigo-200/50 backdrop-blur-md bg-indigo-100/20">
            <table className="min-w-full divide-y divide-indigo-200 relative">
              <thead className="bg-indigo-200/30 text-indigo-800 text-sm font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 relative">
                {payments.map((p, idx) => (
                  <tr
                    key={p.id}
                    className="hover:bg-indigo-100/30 transition border-b border-indigo-100/30 relative"
                  >
                    {/* Order ID with hover + copy */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 relative group/orderid">
                        <span>{p.orderId.slice(0, 8)}...</span>
                        <span
                          className={`absolute z-50 hidden group-hover/orderid:block bg-white border text-gray-700 text-xs px-2 py-1 rounded shadow top-full left-0 mt-1 ${
                            idx === payments.length - 1 ? '-translate-y-12' : ''
                          }`}
                        >
                          {p.orderId}
                        </span>
                        <button
                          onClick={() => handleCopy(p.orderId)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Copy Order ID"
                        >
                          {copiedId === p.orderId ? (
                            <CheckIcon className="w-4 h-4 text-green-600" />
                          ) : (
                            <ClipboardIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-4 py-3 whitespace-nowrap">{p.user.name}</td>

                    {/* Amount */}
                    <td className="px-4 py-3 whitespace-nowrap">₹{p.amount.toFixed(2)}</td>

                    {/* Method */}
                    <td className="px-4 py-3 whitespace-nowrap">{p.method}</td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          p.status === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : p.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {format(new Date(p.createdAt), 'dd MMM yyyy')}
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
