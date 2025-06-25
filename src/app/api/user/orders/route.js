import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ orders: [] }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      orderItems: {
        include: {
          product: true,
          variant: true,
        },
      },
      orderOtp: true,
      payment: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json({ orders });
}

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
    const result = await prisma.$transaction(async (tx) => {
      // 1. Stock check
      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (!variant || variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for variant ${item.variantId}`);
        }
      }

      // 2. Create order
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          vendorId: items[0]?.product?.vendorId || '',
          total,
          address: `${address.street}, ${address.city}, ${address.state}, ${address.country} - ${address.zipCode}`,
          promoCode: promoCode || null,
          giftCard: giftCard || null,
          paymentMethod: paymentMethod.toUpperCase(),
          status: 'PENDING',
          orderItems: {
            create: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.variant?.price || 0,
            })),
          },
        },
      });

      // 3. Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

      await tx.orderOtp.create({
        data: {
          orderId: order.id,
          otp,
        },
      });

      // 4. Decrease stock
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });

    return NextResponse.json({ orderId: result.id, vendorId: result.vendorId });
  } catch (err) {
    console.error('Order creation failed:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
