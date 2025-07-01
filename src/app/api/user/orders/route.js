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
    // Pre-fetch all variants in one go
    const variantIds = items.map(item => item.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
    });

    const variantsMap = Object.fromEntries(variants.map(v => [v.id, v]));

    // Group items by vendor
    const vendorItemsMap = {};
    items.forEach(item => {
      const vendorId = item.product.vendorId;
      if (!vendorItemsMap[vendorId]) vendorItemsMap[vendorId] = [];
      vendorItemsMap[vendorId].push(item);
    });

    // Store generated OTPs to insert later
    const otpDataList = [];
    const createdOrders = [];

    // Run all orders in a single transaction
    await prisma.$transaction(async (tx) => {
      for (const [vendorId, vendorItems] of Object.entries(vendorItemsMap)) {
        // Stock checks
        for (const item of vendorItems) {
          const variant = variantsMap[item.variantId];
          if (!variant || variant.stock < item.quantity) {
            throw new Error(`Insufficient stock for variant ${item.variantId}`);
          }
        }

        // Create order
        const order = await tx.order.create({
          data: {
            userId: session.user.id,
            vendorId,
            total: vendorItems.reduce((acc, item) => acc + (item.variant?.price || 0) * item.quantity, 0),
            address: `${address.street}, ${address.city}, ${address.state}, ${address.country} - ${address.zipCode}`,
            promoCode: promoCode || null,
            giftCard: giftCard || null,
            paymentMethod: paymentMethod.toUpperCase(),
            status: 'PENDING',
            orderItems: {
              create: vendorItems.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.variant?.price || 0,
              })),
            },
          },
        });

        createdOrders.push(order);

        // Prepare OTP (create outside transaction)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpDataList.push({ orderId: order.id, otp });

        // Update stock and set inOrder
        for (const item of vendorItems) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
              inOrder: 3,
            },
          });

          // Low stock notification
          if ((variantsMap[item.variantId]?.stock - item.quantity) < 5) {
            await tx.vendorNotification.create({
              data: {
                vendorId,
                type: 'LOW_STOCK_ALERT',
                content: `Low stock for ${item.variant?.name || 'a product'}`,
              },
            });
          }
        }
      }
    }, {
      timeout: 10000 // 10 seconds transaction timeout
    });

    // Create OTPs outside transaction
    for (const otpEntry of otpDataList) {
      await prisma.orderOtp.create({
        data: otpEntry,
      });
    }

    return NextResponse.json({
      orders: createdOrders.map((order) => ({
        orderId: order.id,
        vendorId: order.vendorId,
      })),
    });
  } catch (err) {
    console.error('Order creation failed:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
