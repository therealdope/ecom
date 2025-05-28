import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@lib/prisma';

export async function PUT(request, { params }) {
    try {
        const token = await getToken({ req: request });
        if (!token || token.role !== 'VENDOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const { name, description, categoryId, imageUrl, variants } = await request.json();

        // Update the product
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                categoryId,
                imageUrl,
                variants: {
                    upsert: variants.map(variant => ({
                        where: { id: variant.id || 'new' },
                        update: {
                            size: variant.size,
                            color: variant.color,
                            sku: variant.sku,
                            price: parseFloat(variant.price),
                            stock: parseInt(variant.stock)
                        },
                        create: {
                            size: variant.size,
                            color: variant.color,
                            sku: variant.sku,
                            price: parseFloat(variant.price),
                            stock: parseInt(variant.stock)
                        }
                    }))
                }
            },
            include: {
                category: true,
                variants: true
            }
        });

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Error updating product: ' + error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const token = await getToken({ req: request });
        if (!token || token.role !== 'VENDOR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // Delete all related records first
        await prisma.$transaction([
            prisma.productVariant.deleteMany({ where: { productId: id } }),
            prisma.cartItem.deleteMany({ where: { productId: id } }),
            prisma.wishlistItem.deleteMany({ where: { productId: id } }),
            prisma.orderItem.deleteMany({ where: { productId: id } }),
            prisma.review.deleteMany({ where: { productId: id } }),
            prisma.product.delete({ where: { id } })
        ]);

        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Error deleting product: ' + error.message }, { status: 500 });
    }
}