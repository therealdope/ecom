// /app/api/user/products/search/route.js
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    if (!query || query.trim() === '') {
        return NextResponse.json({ error: 'Query missing' }, { status: 400 });
    }

    try {
        const products = await prisma.product.findMany({
            where: {
                OR: [{
                        name: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        description: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        category: {
                            name: {
                                contains: query,
                                mode: 'insensitive',
                            },
                        },
                    },
                    {
                        shop: {
                            name: {
                                contains: query,
                                mode: 'insensitive',
                            },
                        },
                    },
                    {
                        vendor: {
                            name: {
                                contains: query,
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            },
            include: {
                variants: true,
                category: true,
                shop: true,
                vendor: true,
            },
        });

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}