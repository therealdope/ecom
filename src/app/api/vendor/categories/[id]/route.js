import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function GET(req) {

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'VENDOR') {
        return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // Get shopId from URL params
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    try {
        const category = await prisma.productCategory.findUnique({
            where: { id: id },
        });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}