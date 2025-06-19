import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// Delete cart item
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId, variantId } = params;

        if (!productId || !variantId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await prisma.cartItem.delete({
            where: {
                userId_productId_variantId: {
                    userId: session.user.id,
                    productId,
                    variantId,
                },
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
        console.error('Cart DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete cart item' }, { status: 500 });
    }
}

// Update cart item quantity
export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId, variantId } = params;
        const { quantity } = await request.json();

        if (!productId || !variantId || typeof quantity !== 'number') {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await prisma.cartItem.update({
            where: {
                userId_productId_variantId: {
                    userId: session.user.id,
                    productId,
                    variantId,
                },
            },
            data: {
                quantity,
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
        console.error('Cart PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
    }
}