import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: params.id
      },
      include: {
        category: true,
        shop: true,
        variants: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const averageRating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / (product.reviews.length || 1);
    product.averageRating = averageRating;

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}