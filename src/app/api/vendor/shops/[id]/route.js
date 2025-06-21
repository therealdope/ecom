import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// PUT: Update a shop
export async function PUT(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { name, description, address, phone } = await req.json();

    try {
        const shop = await prisma.shop.updateMany({
            where: { id, vendorId: session.user.id },
            data: { name, description, address, phone },
        });

        if (shop.count === 0) {
            return NextResponse.json({ error: 'Shop not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating shop:', error);
        return NextResponse.json({ error: 'Failed to update shop' }, { status: 500 });
    }
}

// DELETE: Delete a shop
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'VENDOR') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    try {
        // First, delete all products belonging to this shop
        const products = await prisma.product.findMany({
            where: { shopId: id },
            select: { id: true },
        });

        const productIds = products.map(p => p.id);

        if (productIds.length > 0) {
            // Delete dependent items in proper order
            await prisma.wishlistItem.deleteMany({ where: { productId: { in: productIds } } });
            await prisma.cartItem.deleteMany({ where: { productId: { in: productIds } } });
            await prisma.orderItem.deleteMany({ where: { productId: { in: productIds } } });
            await prisma.review.deleteMany({ where: { productId: { in: productIds } } });
            await prisma.productVariant.deleteMany({ where: { productId: { in: productIds } } });
        }

        // Delete the products
        await prisma.product.deleteMany({ where: { shopId: id } });

        // Finally, delete the shop
        await prisma.shop.delete({
            where: {
                id: id,
                vendorId: session.user.id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting shop:', error);
        return NextResponse.json({ error: 'Failed to delete shop' }, { status: 500 });
    }
}