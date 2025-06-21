import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET: Get all shops of the vendor
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const shops = await prisma.shop.findMany({
            where: { vendorId: session.user.id },
            select: {
                id: true,
                name: true,
                description: true,
                address: true,
                phone: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(shops);
    } catch (error) {
        console.error('Error fetching shops:', error);
        return NextResponse.json({ error: 'Failed to fetch shops' }, { status: 500 });
    }
}

// POST: Create a new shop
export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, description, address, phone } = await req.json();

        const newShop = await prisma.shop.create({
            data: {
                name,
                description,
                address,
                phone,
                vendorId: session.user.id,
            },
        });

        return NextResponse.json(newShop, { status: 201 });
    } catch (error) {
        console.error('Error creating shop:', error);
        return NextResponse.json({ error: 'Failed to create shop' }, { status: 500 });
    }
}