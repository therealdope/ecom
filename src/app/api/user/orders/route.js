import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { items, address, promoCode, giftCard, total, paymentMethod } = await req.json();

  if (!items || !address || !total || !paymentMethod) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        vendorId: items[0]?.product?.vendorId || '', // corrected vendorId source
        total,
        address: `${address.street}, ${address.city}, ${address.state}, ${address.country} - ${address.zipCode}`,
        promoCode: promoCode || null,
        giftCard: giftCard || null,
        paymentMethod: paymentMethod.toUpperCase(),
        status: 'PENDING', // safe default
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant?.price || 0, // fallback if price missing
          })),
        },
      },
    });

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error('Order creation failed:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
