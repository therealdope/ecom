import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ customers: [] }, { status: 401 });
  }

  // Get vendor
  const vendor = await prisma.vendor.findUnique({
    where: { email: session.user.email },
  });
  if (!vendor) {
    return NextResponse.json({ customers: [] }, { status: 403 });
  }

  // Get all distinct users who placed orders for this vendor
  const orders = await prisma.order.findMany({
    where: {
      vendorId: vendor.id,
      status: 'DELIVERED', // Optional: filter by completed orders
    },
    select: {
      userId: true,
      createdAt: true,
      total: true,
    },
  });

  const userOrderMap = new Map();

  for (const order of orders) {
    if (!userOrderMap.has(order.userId)) {
      userOrderMap.set(order.userId, {
        userId: order.userId,
        totalOrders: 1,
        totalAmount: order.total,
        lastOrdered: order.createdAt,
      });
    } else {
      const entry = userOrderMap.get(order.userId);
      entry.totalOrders += 1;
      entry.totalAmount += order.total;
      if (new Date(order.createdAt) > new Date(entry.lastOrdered)) {
        entry.lastOrdered = order.createdAt;
      }
    }
  }

  const customerDetails = await Promise.all(
    [...userOrderMap.keys()].map(async (userId) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
        },
      });

      const entry = userOrderMap.get(userId);
      return {
        userId,
        name: user?.name || 'Unknown',
        email: user?.email || '',
        phone: user?.profile?.phoneNumber || '',
        joinedOn: user?.createdAt,
        totalOrders: entry.totalOrders,
        totalAmount: entry.totalAmount,
        lastOrdered: entry.lastOrdered,
      };
    })
  );

  return NextResponse.json({ customers: customerDetails });
}
