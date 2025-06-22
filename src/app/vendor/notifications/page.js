'use client';

import { useEffect, useState } from 'react';
import {
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  GiftIcon,
  ClockIcon,
  EnvelopeOpenIcon,
  CheckCircleIcon,
  StarIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  XCircleIcon,
  CurrencyRupeeIcon,
} from '@heroicons/react/24/outline';
import VendorDashboardLayout from '@/components/vendor/layout/VendorLayout';

const iconMap = {
  ORDER_PLACED: ShoppingBagIcon,
  ORDER_CONFIRMED: CheckCircleIcon,
  ORDER_SHIPPED: TruckIcon,
  ORDER_DELIVERED: CheckCircleIcon,
  ORDER_CANCELLED: XCircleIcon,
  PAYMENT_SUCCESS: CurrencyRupeeIcon,
  PAYMENT_FAILED: ExclamationTriangleIcon,
  NEW_MESSAGE: ChatBubbleLeftRightIcon,
  NEW_REVIEW: StarIcon,
  PROMO: GiftIcon,
  LOW_STOCK_ALERT: ExclamationTriangleIcon,
};

export default function VendorNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/vendor/notifications');
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
      else setNotifications([]);
    } catch (err) {
      console.error('Fetch failed:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch('/api/vendor/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/vendor/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const hasUnread = Array.isArray(notifications) && notifications.some((n) => !n.read);

  return (
    <VendorDashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-indigo-800">Notifications</h1>
          {hasUnread && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 transition"
            >
              <EnvelopeOpenIcon className="h-5 w-5" />
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-gray-500">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="text-gray-500">No notifications yet.</p>
          ) : (
            notifications.map((notification) => {
              const Icon = iconMap[notification.type] || ClockIcon;
              const timeAgo = new Date(notification.createdAt).toLocaleString();

              return (
                <div
                  key={notification.id}
                  className={`flex items-start justify-between bg-white rounded-lg p-4 shadow-sm border-l-4 ${
                    notification.read ? 'border-gray-300' : 'border-indigo-600'
                  } hover:shadow-md transition`}
                >
                  <div className="flex items-start gap-4">
                    <Icon className="h-6 w-6 text-indigo-600 mt-1" />
                    <div>
                      <h3 className="text-md font-semibold text-gray-800">
                        {notification.type.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-sm text-gray-600">{notification.content}</p>
                      <div className="flex items-center text-xs text-gray-400 mt-1 gap-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{timeAgo}</span>
                      </div>
                    </div>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </VendorDashboardLayout>
  );
}
