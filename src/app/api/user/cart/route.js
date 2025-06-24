import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// Get cart items
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cartItems = await prisma.cartItem.findMany({
            where: { userId: session.user.id },
            include: {
                product: {
                    include: {
                        variants: true,
                        vendor: true,
                        shop: true,
                    }
                },
                variant: true,
            },
        });

        return NextResponse.json(cartItems);
    } catch (error) {
        console.error('Cart GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch cart items' }, { status: 500 });
    }
}

// Add/Update cart item
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId, variantId, quantity } = await request.json();

        if (!productId || !variantId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const cartItem = await prisma.cartItem.upsert({
            where: {
                userId_productId_variantId: {
                    userId: session.user.id,
                    productId,
                    variantId,
                },
            },
            update: {
                quantity: { increment: 1 },
            },
            create: {
                userId: session.user.id,
                productId,
                variantId,
                quantity: 1,
            },
        });

        const updatedCart = await prisma.cartItem.findMany({
            where: { userId: session.user.id },
            include: {
                product: true,
                variant: true,
            },
        });

        return NextResponse.json(updatedCart);
    } catch (error) {
        console.error('Cart POST error:', error);
        return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
    }
}