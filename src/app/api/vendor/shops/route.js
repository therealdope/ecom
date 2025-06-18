import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // First find the vendor associated with the logged-in user
        const vendor = await prisma.vendor.findUnique({
            where: {
                email: session.user.email
            }
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor account not found' }, { status: 404 });
        }

        const data = await request.json();
        const shop = await prisma.shop.create({
            data: {
                name: data.name,
                description: data.description,
                address: data.address,
                phone: data.phone,
                vendor: {
                    connect: {
                        id: vendor.id
                    }
                }
            }
        });

        return NextResponse.json(shop);
    } catch (error) {
        console.error('Error creating shop:', error);
        return NextResponse.json({ error: 'Failed to create shop' }, { status: 500 });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const shops = await prisma.shop.findMany({
            where: {
                vendorId: session.user.id,
            },
            select: {
                id: true,
                name: true
            },
        });

        return NextResponse.json(shops);
    } catch (error) {
        console.error('Error fetching shops:', error);
        return NextResponse.json({ error: 'Failed to fetch shops' }, { status: 500 });
    }
}