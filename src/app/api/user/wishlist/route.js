import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// Get wishlist items
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const wishlistItems = await prisma.wishlistItem.findMany({
            where: { userId: session.user.id },
            include: {
                product: {
                    include: {
                        variants: true,
                        vendor: true,
                        shop: true,
                    }
                }
            },
        });



        return NextResponse.json(wishlistItems);
    } catch (error) {
        console.error('Wishlist GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch wishlist items' }, { status: 500 });
    }
}

// Toggle wishlist item
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        // Check if item exists in wishlist
        const existingItem = await prisma.wishlistItem.findUnique({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId,
                },
            },
        });

        if (existingItem) {
            // Remove item if it exists
            await prisma.wishlistItem.delete({
                where: {
                    userId_productId: {
                        userId: session.user.id,
                        productId,
                    },
                },
            });
        } else {
            // Add item if it doesn't exist
            await prisma.wishlistItem.create({
                data: {
                    userId: session.user.id,
                    productId,
                },
            });
        }

        // Fetch updated wishlist
        const updatedWishlist = await prisma.wishlistItem.findMany({
            where: { userId: session.user.id },
            include: {
                product: {
                    include: {
                        variants: true,
                    }
                },
            },
        });

        return NextResponse.json(updatedWishlist);
    } catch (error) {
        console.error('Wishlist POST error:', error);
        return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
    }
}