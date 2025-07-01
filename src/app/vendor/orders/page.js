'use client';

import { useEffect, useState, useRef } from 'react';
import VendorLayout from '@/components/vendor/layout/VendorLayout';
import { format, isWithinInterval, parseISO } from 'date-fns';
import {
  CurrencyRupeeIcon,
  TruckIcon,
  ClipboardDocumentCheckIcon,
  XMarkIcon,
  ClipboardIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {useToast} from '@/context/ToastContext';
import Image from 'next/image';

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPayment, setFilterPayment] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchOrderId, setSearchOrderId] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const modalRef = useRef(null);
  const {showToast} = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch('/api/vendor/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    };
    fetchOrders();
  }, []);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setSelectedOrder(null);
      setEnteredOtp('');
      setOtpError('');
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    if (typeof address !== 'string') return 'Invalid Address';
    const [firstPart, zip] = address.split('-').map((s) => s.trim());
    return zip ? `${firstPart}, Zip: ${zip}` : firstPart;
  };

  const handleOtpSubmit = async () => {
    setFormOpen(false);
    setOtpError('');
    if (!enteredOtp.trim()) return setOtpError('Please enter OTP');

    const res = await fetch(`/api/vendor/orders/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: selectedOrder.id, otp: enteredOtp }),
    });
    const data = await res.json();
    
    showToast({
      title: 'OTP Verified',
      description: 'Order has been marked as delivered',
    });

    if (res.ok) {
      if (selectedOrder.paymentMethod === 'COD') {
        await fetch('/api/payment/cod', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: selectedOrder.id,
            userId: selectedOrder.userId,
            vendorId: selectedOrder.vendorId,
            amount: selectedOrder.total,
            method: 'COD',
            status: 'PAID',
          }),
        });
        showToast({
          title: 'Payment Successful',
          description: 'Payment Marked as Paid',
        });
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                status: 'DELIVERED',
                payment:
                  selectedOrder.paymentMethod === 'COD'
                    ? [
                        {
                          id: crypto.randomUUID(),
                          orderId: o.id,
                          userId: o.userId,
                          vendorId: o.vendorId,
                          amount: o.total,
                          method: 'COD',
                          status: 'PAID',
                          createdAt: new Date().toISOString(),
                        },
                      ]
                    : o.payment,
              }
            : o
        )
      );
      setSelectedOrder(null);
    } else {
      setOtpError(data.error || 'Invalid OTP');
    }
  };

  const handleCancelOrder = async () => {
    const confirmed = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmed) return;
    setFormOpen(false);
    const res = await fetch('/api/vendor/orders/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: selectedOrder.id }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: 'CANCELLED' } : o))
      );
      setSelectedOrder(null);
      showToast({
        title: 'Order Cancelled',
        description: 'Order has been marked as cancelled',
      });
    }
  };

  const clearFilters = () => {
    setFilterStatus('ALL');
    setFilterPayment('ALL');
    setStartDate('');
    setEndDate('');
    setSearchOrderId('');
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
    const matchSearch = order.id.toLowerCase().includes(searchOrderId.toLowerCase());
    return matchStatus && matchPayment && matchDate && matchSearch;
  });

  return (
    <VendorLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center sm:hidden mb-4">
          <h2 className="text-2xl font-semibold text-indigo-700">Customer Orders</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg hover:bg-indigo-200"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className={`grid gap-4 sm:flex sm:flex-wrap sm:items-end sm:justify-between mb-6 ${showFilters ? 'block' : 'hidden'} sm:block`}>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Order ID</label>
              <input
                type="text"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                className="px-4 py-2 border border-indigo-300 rounded-lg shadow-sm focus:ring-indigo-400 text-sm text-indigo-800"
                placeholder="Search by ID"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm text-indigo-800 shadow-sm"
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
                className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm text-indigo-800 shadow-sm"
              >
                <option value="ALL">All</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-indigo-300 px-4 py-2 text-sm text-indigo-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-indigo-300 px-4 py-2 text-sm text-indigo-800"
              />
            </div>

            {(startDate || endDate || filterStatus !== 'ALL' || filterPayment !== 'ALL' || searchOrderId) && (
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
                onClick={() => {
                  setSelectedOrder(order);
                  setFormOpen(true);
                }}
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
        {formOpen && selectedOrder && (
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
                >
                  {copiedOrderId ? (
                    <CheckIcon className="w-4 h-4 text-green-600" />
                  ) : (
                    <ClipboardIcon className="w-4 h-4" />
                  )}
                </button>
              </p>
              <p className="text-sm mb-1 text-gray-600"><strong>Status:</strong> {selectedOrder.status}</p>
              <p className="text-sm mb-1 text-gray-600"><strong>Payment:</strong> {selectedOrder.payment?.[0]?.status || 'PENDING'}</p>
              <p className="text-sm mb-1 text-gray-600"><strong>Address:</strong> {formatAddress(selectedOrder.address)}</p>
              {console.log(selectedOrder)}
               <p className="text-sm mb-1 text-gray-600"><strong>Phone:</strong> +91 {selectedOrder.user.profile.phoneNumber}</p>
              <p className="text-sm mb-3 text-gray-600"><strong>Total:</strong> ₹{selectedOrder.total.toFixed(2)}</p>

              <div className="text-sm text-gray-700 mb-4">
                <strong>Items:</strong>
                <ul className="mt-2 space-y-3">
                  {selectedOrder.orderItems.map((item) => (
                    <li key={item.id} className="flex items-start gap-4">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        width={100}
                        height={100}
                        className="h-16 w-16 rounded-md object-cover border"
                      />
                      <div>
                        <p className="font-medium text-indigo-800">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Size: {item.variant.size || 'N/A'}, Color: {item.variant.color || 'N/A'}</p>
                        <p className="text-sm">Quantity: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedOrder.status === 'PENDING' && (
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mt-6">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter Delivery OTP:</label>
                    <input
                      type="text"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    />
                    {otpError && <p className="text-sm text-red-500 mt-1">{otpError}</p>}
                    <div className="flex justify-between">
                    <button onClick={handleOtpSubmit} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                      Confirm Delivery
                    </button>
                    {selectedOrder.status !== 'CANCELLED' && (
                    <button
                      onClick={handleCancelOrder}
                      className="mt-2 w px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Cancel Order
                    </button>
                  )}
                  </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
