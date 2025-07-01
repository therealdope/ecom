'use client';

import { useState } from 'react';
import {
  SpeakerWaveIcon,
  BellAlertIcon,
  SparklesIcon,
  ArrowPathIcon,
  MoonIcon,
  ChatBubbleLeftRightIcon,
  CursorArrowRaysIcon,
} from '@heroicons/react/24/outline';
import VendorDashboardLayout from '@/components/vendor/layout/VendorLayout';

export default function VendorSettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsAlerts: false,
    productRecommendations: true,
    orderUpdates: true,
    darkMode: false,
    chatSupport: true,
    personalizedAds: false,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const settingItems = [
    {
      key: 'emailNotifications',
      name: 'Email Notifications',
      description: 'Get order updates and platform announcements via email.',
      icon: SpeakerWaveIcon,
    },
    {
      key: 'smsAlerts',
      name: 'SMS Alerts',
      description: 'Receive important updates like order placements and cancellations.',
      icon: BellAlertIcon,
    },
    {
      key: 'productRecommendations',
      name: 'Product Insights',
      description: 'Receive suggestions for improving your product listings.',
      icon: SparklesIcon,
    },
    {
      key: 'orderUpdates',
      name: 'Order Updates',
      description: 'Get real-time updates on customer orders and deliveries.',
      icon: ArrowPathIcon,
    },
    {
      key: 'darkMode',
      name: 'Dark Mode',
      description: 'Enable a dark theme for your dashboard.',
      icon: MoonIcon,
    },
    {
      key: 'chatSupport',
      name: 'Customer Chat',
      description: 'Enable chat functionality with customers.',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      key: 'personalizedAds',
      name: 'Ad Preferences',
      description: 'Control ad settings and promotional campaigns.',
      icon: CursorArrowRaysIcon,
    },
  ];

  return (
    <VendorDashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold text-indigo-800 mb-8">Vendor Settings</h1>
        <h1 className="text-red-600 mb-6 uppercase text-center text-2xl">
          coming soon...
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <item.icon className="h-6 w-6 text-indigo-600 shrink-0" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>

              <button
                onClick={() => toggleSetting(item.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                  settings[item.key] ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                    settings[item.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </VendorDashboardLayout>
  );
}
