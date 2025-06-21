import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ customers: [] }, { status: 401 });
  }

  // Fetch vendorId from session or profile
  const vendor = await prisma.vendor.findUnique({
    where: { email: session.user.email },
  });
  if (!vendor) return NextResponse.json({ customers: [] }, { status: 403 });

  // Aggregate per customer
  const data = await prisma.payment.groupBy({
    by: ['userId'],
    where: { vendorId: vendor.id, status: 'PAID' },
    _sum: { amount: true },
    _count: { orderId: true },
  });

  // Fetch user and last order info
  const customers = await Promise.all(data.map(async (grp) => {
    const user = await prisma.user.findUnique({ where: { id: grp.userId } });
    const lastPayment = await prisma.payment.findFirst({
      where: { userId: grp.userId, vendorId: vendor.id, status: 'PAID' },
      orderBy: { createdAt: 'desc' },
    });
    return {
      userId: grp.userId,
      name: user?.name || 'Unknown',
      email: user?.email || '',
      joinedOn: user?.createdAt,
      totalAmount: grp._sum.amount,
      totalOrders: grp._count.orderId,
      lastOrdered: lastPayment?.createdAt,
    };
  }));

  return NextResponse.json({ customers });
}
