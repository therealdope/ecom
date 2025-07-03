'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Loader from '@/components/shared/Loader';
import VendorLayout from '@/components/vendor/layout/VendorLayout';
import { useRouter } from 'next/navigation';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function VendorDashboard() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); 
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/vendor/dashboard?timeRange=${timeRange}`);
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  if (status === 'loading' || loading) {
    return <Loader />;
  }

  const salesData = {
    labels: dashboardData?.salesChart.labels || [],
    datasets: [
      {
        label: 'Sales',
        data: dashboardData?.salesChart.data || [],
        borderColor: 'rgb(79, 70, 229)',
        tension: 0.1,
      },
    ],
  };

  const orderStatusData = {
    labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    datasets: [
      {
        label: 'Orders by Status',
        data: dashboardData?.orderStatusChart || [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(234, 179, 8, 0.5)',
          'rgba(79, 70, 229, 0.5)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(34, 197, 94, 0.5)',
          'rgba(239, 68, 68, 0.5)',
        ],
      },
    ],
  };

  return (
    <VendorLayout>
      {/* Time Range Selector */}
      <div className="mb-6 flex justify-end">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last 12 Months</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Total Products</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{dashboardData?.stats.totalProducts || 0}</p>
          <p className="mt-1 text-sm text-gray-500">
            {dashboardData?.stats.productGrowth > 0 ? '+' : ''}
            {dashboardData?.stats.productGrowth}% from last period
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{dashboardData?.stats.totalOrders || 0}</p>
          <p className="mt-1 text-sm text-gray-500">
            {dashboardData?.stats.orderGrowth > 0 ? '+' : ''}
            {dashboardData?.stats.orderGrowth}% from last period
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">₹{(dashboardData?.stats.totalRevenue || 0).toLocaleString()}</p>
          <p className="mt-1 text-sm text-gray-500">
            {dashboardData?.stats.revenueGrowth > 0 ? '+' : ''}
            {dashboardData?.stats.revenueGrowth}% from last period
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Avg. Order Value</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">₹{(dashboardData?.stats.avgOrderValue || 0).toLocaleString()}</p>
          <p className="mt-1 text-sm text-gray-500">
            {dashboardData?.stats.avgOrderGrowth > 0 ? '+' : ''}
            {dashboardData?.stats.avgOrderGrowth}% from last period
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h3>
          <div className="h-[300px]">
            <Line
              data={salesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `₹${value}`,
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Orders by Status</h3>
          <div className="h-[300px]">
            <Bar
              data={orderStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
        <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData?.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{order.total.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-center -mt-4 mb-8">
  <button 
  onClick={() => router.push('/vendor/orders')}
  className="bg-white hover:bg-gray-50 text-gray-500 px-4 py-1.5 rounded-xl border border-gray-300 shadow-md transition-all duration-200">
    All Orders
  </button>
</div>
      </div>
    </VendorLayout>
  );
}
