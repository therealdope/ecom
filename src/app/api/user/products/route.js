import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Get all products with their related data
        const products = await prisma.product.findMany({
            include: {
                category: true,
                shop: true,
                reviews: true,
                variants: {
                    where: {
                        NOT: { inOrder: 1 } // Exclude variants with inOrder === 1
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Helper function to calculate average rating
        const getAverageRating = (reviews) => {
            if (reviews.length === 0) return 0;
            const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
            return sum / reviews.length;
        };

        // Process and categorize products
        const processedProducts = products.map(product => ({
            ...product,
            averageRating: getAverageRating(product.reviews)
        }));

        // Shuffle all products for random display
        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        const shuffledProducts = shuffleArray([...processedProducts]);

        return NextResponse.json({
            newArrivals: processedProducts.slice(0, 4),
            trending: processedProducts
                .sort((a, b) => b.averageRating - a.averageRating)
                .slice(0, 4),
            topRated: processedProducts
                .filter(product => product.averageRating >= 4)
                .slice(0, 4),
            random: shuffledProducts.slice(0, 4),
            all: shuffledProducts // Send all shuffled products
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}