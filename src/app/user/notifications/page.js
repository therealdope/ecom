'use client';

import { useState } from 'react';
import {
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  GiftIcon,
  ClockIcon,
  EnvelopeOpenIcon,
} from '@heroicons/react/24/outline';
import UserDashboardLayout from '@/components/user/layout/UserDashboardLayout';

const demoNotifications = [
  {
    id: 1,
    title: 'Order Shipped!',
    message: 'Your order #ORD123 has been shipped.',
    icon: ShoppingBagIcon,
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    title: 'New Message from Vendor',
    message: 'Hey! Your product will be delivered tomorrow.',
    icon: ChatBubbleLeftRightIcon,
    time: '5 hours ago',
    read: false,
  },
  {
    id: 3,
    title: '50% OFF on Electronics!',
    message: 'Limited-time offer on select gadgets.',
    icon: GiftIcon,
    time: 'Yesterday',
    read: true,
  },
  {
    id: 4,
    title: 'Order Delivered',
    message: 'Your order #ORD122 was delivered.',
    icon: ShoppingBagIcon,
    time: '2 days ago',
    read: true,
  },
];

export default function UserNotificationsPage() {
  const [notifications, setNotifications] = useState(demoNotifications);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <UserDashboardLayout>
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
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications yet.</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start justify-between bg-white rounded-lg p-4 shadow-sm border-l-4 ${
                  notification.read ? 'border-gray-300' : 'border-indigo-600'
                } hover:shadow-md transition`}
              >
                <div className="flex items-start gap-4">
                  <notification.icon className="h-6 w-6 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="text-md font-semibold text-gray-800">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <div className="flex items-center text-xs text-gray-400 mt-1 gap-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{notification.time}</span>
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
            ))
          )}
        </div>
      </div>
    </UserDashboardLayout>
  );
}
