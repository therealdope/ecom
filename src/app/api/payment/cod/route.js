import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { orderId, userId, vendorId, amount, method } = await req.json();

    if (!orderId || !userId || !vendorId || !amount || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if a payment already exists for this order
    const existingPayment = await prisma.payment.findFirst({
      where: { orderId, method: 'COD', status: 'PAID' },
    });

    if (existingPayment) {
      return NextResponse.json({ message: 'Payment already marked as PAID.' });
    }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId,
        vendorId,
        amount,
        method,
        status: 'PAID',
      },
    });

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (err) {
    console.error('[PAYMENT_CREATE_ERROR]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
