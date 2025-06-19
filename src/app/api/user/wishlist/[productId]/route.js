import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId } = params;

        // Add item to wishlist
        await prisma.wishlistItem.create({
            data: {
                userId: session.user.id,
                productId: productId
            }
        });

        // Fetch updated wishlist
        const updatedWishlist = await prisma.wishlistItem.findMany({
            where: { userId: session.user.id },
            include: {
                product: {
                    include: {
                        variants: true
                    }
                }
            }
        });

        return NextResponse.json(updatedWishlist);
    } catch (error) {
        console.error('Wishlist POST error:', error);
        return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId } = params;

        // Remove item from wishlist
        await prisma.wishlistItem.delete({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId: productId
                }
            }
        });

        // Fetch updated wishlist
        const updatedWishlist = await prisma.wishlistItem.findMany({
            where: { userId: session.user.id },
            include: {
                product: {
                    include: {
                        variants: true
                    }
                }
            }
        });

        return NextResponse.json(updatedWishlist);
    } catch (error) {
        console.error('Wishlist DELETE error:', error);
        return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
    }
}