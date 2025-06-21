import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ orders: [] }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { email: session.user.email },
  });

  if (!vendor) {
    return NextResponse.json({ orders: [] }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    where: {
      vendorId: vendor.id,
    },
    include: {
      orderItems: {
        include: {
          product: true,
          variant: true,
        },
      },
      payment: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      orderOtp: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json({ orders });
}
