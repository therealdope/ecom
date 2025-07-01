import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/vendor/notifications — fetch vendor notifications
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const vendorId = session?.user?.id;

    if (!vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await prisma.vendorNotification.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('GET /vendor/notifications error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: vendor sends notification to user
export async function POST(req) {
  try {
    const body = await req.json();
    const {userId, type, content } = body;

    const session = await getServerSession(authOptions);
    const vendorId = session?.user?.id;

    if (!userId || !vendorId || !type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notification = await prisma.userNotification.create({
      data: {
        userId,
        type,
        content,
      },
    });

    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (error) {
    console.error('Notification POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/vendor/notifications — mark one or all as read
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    const vendorId = session?.user?.id;

    if (!vendorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, all } = await req.json();

    if (all) {
      await prisma.vendorNotification.updateMany({
        where: { vendorId, read: false },
        data: { read: true },
      });
    } else if (id) {
      await prisma.vendorNotification.update({
        where: { id },
        data: { read: true },
      });
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /vendor/notifications error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
