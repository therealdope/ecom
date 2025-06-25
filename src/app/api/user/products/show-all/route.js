// /app/api/user/products/show-all/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            include: {
                variants: true,
                category: true,
                shop: true,
                vendor: true,
            },
        });

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Error fetching products:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}