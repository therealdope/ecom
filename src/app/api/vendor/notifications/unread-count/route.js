import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'VENDOR') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const count = await prisma.vendorNotification.count({
            where: {
                vendorId: session.user.id,
                read: false,
            },
        });

        return NextResponse.json({ count }, { status: 200 });
    } catch (error) {
        console.error('Error fetching unread notifications count:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}