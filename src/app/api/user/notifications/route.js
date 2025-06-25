import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/user/notifications — Fetch user notifications
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await prisma.userNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('GET /notifications error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: User sends notification to Vendor
export async function POST(req) {
  try {
    const body = await req.json();
    const {vendorId, type, content } = body;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId || !vendorId || !type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notification = await prisma.vendorNotification.create({
      data: {
        vendorId,
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

// PATCH /api/user/notifications — Mark one or all as read
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, all } = await req.json();

    if (all) {
      await prisma.userNotification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    } else if (id) {
      await prisma.userNotification.update({
        where: { id },
        data: { read: true },
      });
    } else {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /notifications error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
