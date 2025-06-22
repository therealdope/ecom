import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/user/products/[id]/reviews
export async function GET(req, { params }) {
    const productId = params.id;

    if (!productId) {
        return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    try {
        const reviews = await prisma.review.findMany({
            where: {
                productId,
            },
            include: {
                user: {
                    select: {
                        name: true,
                        profile: {
                            select: {
                                avatar: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error('Error fetching product reviews:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}