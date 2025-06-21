'use client';

import { useEffect, useState, useRef } from 'react';
import UserDashboardLayout from '@/components/user/layout/UserDashboardLayout';
import { format, isWithinInterval, parseISO } from 'date-fns';
import {
  CurrencyRupeeIcon,
  TruckIcon,
  ClipboardDocumentCheckIcon,
  XMarkIcon,
  ClipboardIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export default function UserOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPayment, setFilterPayment] = useState('ALL');
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch('/api/user/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    };
    fetchOrders();
  }, []);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setSelectedOrder(null);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    if (typeof address !== 'string') return 'Invalid Address';

    const [firstPart, zip] = address.split('-').map((s) => s.trim());
    return zip ? `${firstPart}, Zip: ${zip}` : firstPart;
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setFilterStatus('ALL');
    setFilterPayment('ALL');
  };

  const filteredOrders = orders.filter((order) => {
    const matchStatus = filterStatus === 'ALL' || order.status === filterStatus;
    const matchPayment = filterPayment === 'ALL' || (order.payment?.[0]?.status || 'PENDING') === filterPayment;
    const matchDate =
      (!startDate || !endDate) ||
      isWithinInterval(parseISO(order.createdAt), {
        start: new Date(startDate),
        end: new Date(endDate),
      });
    return matchStatus && matchPayment && matchDate;
  });

  return (
    <UserDashboardLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8 relative">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-indigo-700">Your Orders</h2>

          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm text-indigo-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Payment</label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm text-indigo-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="ALL">All</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="startDate" className="text-sm text-gray-600 mb-1">Start Date</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm text-indigo-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="endDate" className="text-sm text-gray-600 mb-1">End Date</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm text-indigo-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {(startDate || endDate || filterStatus !== 'ALL' || filterPayment !== 'ALL') && (
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 mt-1 sm:mt-5 hover:underline text-center p-2 bg-indigo-50 rounded-xl"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Order Cards */}
        {filteredOrders.length === 0 ? (
          <p className="text-gray-500">No orders found for selected filters.</p>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="cursor-pointer rounded-2xl bg-indigo-100/20 p-5 shadow-md backdrop-blur-md transition hover:shadow-lg border border-indigo-200/20"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-base font-medium text-indigo-600 mb-1">
                      Order ID: <span className="text-indigo-900">{order.id.slice(0, 8)}...</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Placed on {format(new Date(order.createdAt), 'dd MMM yyyy')}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="text-xs text-gray-500 mb-1">Delivery</div>
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-indigo-400/20 text-indigo-800">
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-xs text-gray-500 mb-1">Payment</div>
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-400/20 text-green-700">
                        {order.payment?.[0]?.status || 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-700 space-y-1">
                  {order.orderOtp?.otp && (
                    <p className="flex items-center gap-2">
                      <ClipboardIcon className="h-5 w-5 text-indigo-500" />
                      <span className="font-medium text-gray-800">Delivery OTP:</span>
                      <span className="text-gray-700">{order.orderOtp.otp}</span>
                    </p>
                  )}

                  <p className="flex items-center gap-2">
                    <TruckIcon className="h-5 w-5 text-indigo-500" />
                    <span className="font-medium text-gray-800">Shipping Address:</span>
                    {formatAddress(order.address)}
                  </p>
                  <p className="flex items-center gap-2">
                    <ClipboardDocumentCheckIcon className="h-5 w-5 text-indigo-500" />
                    <span className="font-medium text-gray-800">Payment Method:</span>
                    {order.paymentMethod}
                  </p>
                  <p className="flex items-center gap-2">
                    <CurrencyRupeeIcon className="h-5 w-5 text-indigo-500" />
                    <span className="font-medium text-gray-800">Total:</span> ₹{order.total.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedOrder && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4"
            onClick={handleOverlayClick}
          >
            <div
              ref={modalRef}
              className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-xl relative"
            >
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
                onClick={() => setSelectedOrder(null)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              <h3 className="text-xl font-semibold text-indigo-700 mb-4">Order Details</h3>

              <p className="text-sm mb-1 text-gray-600 flex items-center gap-2">
                <strong>Order ID:</strong> {selectedOrder.id}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedOrder.id);
                    setCopiedOrderId(true);
                    setTimeout(() => setCopiedOrderId(false), 1500);
                  }}
                  className="ml-2 text-indigo-600 hover:text-indigo-800 transition"
                  title="Copy Order ID"
                >
                  {copiedOrderId ? (
                    <CheckIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <ClipboardIcon className="w-4 h-4" />
                  )}
                </button>
              </p>

              {selectedOrder.orderOtp?.otp && (
                <p className="text-sm mb-1 text-gray-600">
                  <strong>Delivery OTP:</strong> {selectedOrder.orderOtp.otp}
                </p>
              )}

              <p className="text-sm mb-1 text-gray-600">
                <strong>Date:</strong> {format(new Date(selectedOrder.createdAt), 'dd MMM yyyy')}
              </p>
              <p className="text-sm mb-1 text-gray-600">
                <strong>Status:</strong> {selectedOrder.status}
              </p>
              <p className="text-sm mb-1 text-gray-600">
                <strong>Payment Status:</strong> {selectedOrder.payment?.[0]?.status || 'PENDING'}
              </p>
              <p className="text-sm mb-1 text-gray-600">
                <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
              </p>
              <p className="text-sm mb-3 text-gray-600">
                <strong>Shipping Address:</strong> {formatAddress(selectedOrder.address)}
              </p>

              <div className="text-sm text-gray-700">
                <strong>Items:</strong>
                <ul className="mt-2 space-y-3">
                  {selectedOrder.orderItems.map((item) => (
                    <li key={item.id} className="flex items-start gap-4">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-16 w-16 rounded-md object-cover border"
                      />
                      <div>
                        <p className="font-medium text-indigo-800">{item.product.name}</p>
                        <p className="text-xs text-gray-500">
                          Size: {item.variant.size || 'N/A'}, Color: {item.variant.color || 'N/A'}
                        </p>
                        <p className="text-sm">
                          Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
}
