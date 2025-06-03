import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


export async function GET(req) {

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'VENDOR') {
        return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // Get shopId from URL params
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get('shopId');

    if (!shopId) {
        return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 });
    }

    // Verify the shop belongs to the vendor
    if (shopId === 'all') {
        const products = await prisma.product.findMany({
            include: {
                category: true,
                variants: true,
                shop: true
            }
        });
        return NextResponse.json(products);

    } else {
        const shop = await prisma.shop.findFirst({
            where: {
                id: shopId,
                vendorId: session.user.id
            }
        });

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found or unauthorized' }, { status: 404 });
        }

        const products = await prisma.product.findMany({
            where: {
                shopId: shop.id
            },
            include: {
                category: true,
                variants: true,
                shop: true
            }
        });
        return NextResponse.json(products);
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'VENDOR') {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
        }

        const data = await request.json();
        const { name, description, categoryId, category, variants, imageUrl, shopId } = data;

        if (!shopId) {
            return NextResponse.json({ error: 'Shop ID is required' }, { status: 400 });
        }
        // Handle category
        let categoryRecord;
        if (categoryId) {
            categoryRecord = await prisma.productCategory.findUnique({
                where: { id: categoryId }
            });
            if (!categoryRecord) {
                return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
            }
        } else if (category) {
            categoryRecord = await prisma.productCategory.findFirst({
                where: {
                    name: {
                        equals: category.trim(),
                        mode: 'insensitive'
                    }
                }
            });

            if (!categoryRecord) {
                categoryRecord = await prisma.productCategory.create({
                    data: { name: category.trim() }
                });
            }
        } else {
            return NextResponse.json({ error: 'Category ID or new category name is required' }, { status: 400 });
        }

        // Create product in all shops owned by the vendor
        if (shopId === 'all') {
            const allshops = await prisma.shop.findMany({
                where: {
                    vendorId: session.user.id
                }
            });

            const createdProducts = [];

            for (const shop of allshops) {
                // Prevent duplicate product by name in the same shop
                const existing = await prisma.product.findFirst({
                    where: {
                        name,
                        shopId: shop.id
                    }
                });
                if (existing) continue;

                const product = await prisma.product.create({
                    data: {
                        name,
                        description,
                        imageUrl: imageUrl ?.trim() || '',
                        categoryId: categoryRecord.id,
                        shopId: shop.id,
                        vendorId: session.user.id,
                        variants: {
                            create: variants.map(variant => ({
                                size: variant.size,
                                color: variant.color,
                                sku: variant.sku,
                                price: parseFloat(variant.price),
                                stock: parseInt(variant.stock)
                            }))
                        }
                    },
                    include: {
                        category: true,
                        variants: true,
                        shop: true,
                        vendor: true
                    }
                });

                createdProducts.push(product);
            }

            return NextResponse.json({ message: 'Products created for all shops', products: createdProducts }, { status: 201 });
        }

        // Verify the shop belongs to the vendor
        const shop = await prisma.shop.findFirst({
            where: {
                id: shopId,
                vendorId: session.user.id
            }
        });

        if (!shop) {
            return NextResponse.json({ error: 'Shop not found or unauthorized' }, { status: 404 });
        }

        // Prevent duplicate product in this shop
        const existing = await prisma.product.findFirst({
            where: {
                name,
                shopId: shop.id
            }
        });
        if (existing) {
            return NextResponse.json({ error: 'Product with the same name already exists in this shop' }, { status: 409 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                imageUrl: imageUrl ?.trim() || '',
                categoryId: categoryRecord.id,
                shopId: shop.id,
                vendorId: session.user.id,
                variants: {
                    create: variants.map(variant => ({
                        size: variant.size,
                        color: variant.color,
                        sku: variant.sku,
                        price: parseFloat(variant.price),
                        stock: parseInt(variant.stock)
                    }))
                }
            },
            include: {
                category: true,
                variants: true,
                shop: true,
                vendor: true
            }
        });

        return NextResponse.json(product, { status: 201 });

    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}