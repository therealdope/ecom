import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, rating, comment } = await req.json();

  if (!productId || !rating) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Check if the product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Check if user has purchased and received the product
  const deliveredOrder = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      status: 'DELIVERED',
      orderItems: {
        some: {
          productId: productId,
        },
      },
    },
  });

  if (!deliveredOrder) {
    return NextResponse.json(
      { error: 'You can only review products from delivered orders' },
      { status: 403 }
    );
  }

  // Create the review
  const review = await prisma.review.create({
    data: {
      productId,
      userId: session.user.id,
      rating: Number(rating),
      comment: comment || '',
    },
  });

  return NextResponse.json({ success: true, review });
}