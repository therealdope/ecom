import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  const { orderId, otp } = await req.json();

  if (!orderId || !otp) {
    return NextResponse.json({ error: 'Order ID and OTP are required' }, { status: 400 });
  }

  try {
    const orderOtp = await prisma.orderOtp.findUnique({
      where: { orderId },
    });

    if (!orderOtp) {
      return NextResponse.json({ error: 'OTP not found for this order' }, { status: 404 });
    }

    if (orderOtp.verified) {
      return NextResponse.json({ error: 'OTP already used' }, { status: 400 });
    }

    if (orderOtp.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'DELIVERED' },
      }),
      prisma.orderOtp.update({
        where: { orderId },
        data: { verified: true },
      }),
    ]);

    return NextResponse.json({ message: 'Order marked as delivered' });
  } catch (err) {
    console.error('OTP verification failed:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
