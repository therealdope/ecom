import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const timeRange = searchParams.get('timeRange') || 'week';

  // Calculate date ranges
  const now = new Date();
  let startDate = new Date();
  let previousStartDate = new Date();

  switch (timeRange) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      previousStartDate.setDate(now.getDate() - 14);
      break;
    case 'month':
      startDate.setDate(now.getDate() - 30);
      previousStartDate.setDate(now.getDate() - 60);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      previousStartDate.setFullYear(now.getFullYear() - 2);
      break;
  }

  // Get current period stats
  const [products, orders, orderStatuses, recentOrders] = await Promise.all([
    // Total products
    prisma.product.count({
      where: { vendorId: session.user.id },
    }),

    // Orders in current period
    prisma.order.findMany({
      where: {
        vendorId: session.user.id,
        createdAt: { gte: startDate },
      },
      include: {
        payment: true,
      },
    }),

    // Order status distribution
    prisma.order.groupBy({
      by: ['status'],
      where: {
        vendorId: session.user.id,
        createdAt: { gte: startDate },
      },
      _count: true,
    }),

    // Recent orders
    prisma.order.findMany({
      where: { vendorId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: true,
        payment: true,
      },
    }),
  ]);

  // Get previous period orders for growth calculation
  const previousOrders = await prisma.order.findMany({
    where: {
      vendorId: session.user.id,
      createdAt: {
        gte: previousStartDate,
        lt: startDate,
      },
    },
    include: {
      payment: true,
    },
  });

  // Calculate revenues
  const currentRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0);

  // Calculate growth percentages
  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Prepare sales chart data
  const salesChartData = await getSalesChartData(session.user.id, startDate, timeRange);

  // Prepare order status chart data
  const orderStatusCounts = {
    PENDING: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };
  orderStatuses.forEach((status) => {
    orderStatusCounts[status.status] = status._count;
  });

  return NextResponse.json({
    stats: {
      totalProducts: products,
      totalOrders: orders.length,
      totalRevenue: currentRevenue,
      avgOrderValue: orders.length > 0 ? Math.round(currentRevenue / orders.length) : 0,
      productGrowth: 0, // Would need historical product data for this
      orderGrowth: calculateGrowth(orders.length, previousOrders.length),
      revenueGrowth: calculateGrowth(currentRevenue, previousRevenue),
      avgOrderGrowth: calculateGrowth(
        orders.length > 0 ? currentRevenue / orders.length : 0,
        previousOrders.length > 0 ? previousRevenue / previousOrders.length : 0
      ),
    },
    salesChart: salesChartData,
    orderStatusChart: Object.values(orderStatusCounts),
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      customerName: order.user.name,
      createdAt: order.createdAt,
      total: order.total,
      status: order.status,
    })),
  });
}

async function getSalesChartData(vendorId, startDate, timeRange) {
  const labels = [];
  const data = [];
  const now = new Date();

  let format;
  let intervals;
  let dateFormat;

  switch (timeRange) {
    case 'week':
      intervals = 7;
      format = 'day';
      dateFormat = { weekday: 'short' };
      break;
    case 'month':
      intervals = 30;
      format = 'day';
      dateFormat = { month: 'short', day: 'numeric' };
      break;
    case 'year':
      intervals = 12;
      format = 'month';
      dateFormat = { month: 'short' };
      break;
  }

  for (let i = intervals - 1; i >= 0; i--) {
    const date = new Date();
    if (format === 'day') {
      date.setDate(now.getDate() - i);
    } else {
      date.setMonth(now.getMonth() - i);
    }

    const nextDate = new Date(date);
    if (format === 'day') {
      nextDate.setDate(date.getDate() + 1);
    } else {
      nextDate.setMonth(date.getMonth() + 1);
    }

    const orders = await prisma.order.findMany({
      where: {
        vendorId,
        createdAt: {
          gte: date,
          lt: nextDate,
        },
      },
    });

    const dayRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    labels.push(date.toLocaleDateString('en-US', dateFormat));
    data.push(dayRevenue);
  }

  return { labels, data };
}