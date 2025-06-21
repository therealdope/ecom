import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'vendor';

  const vendor = await prisma.vendor.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  if (type === 'vendor') {
    const reviews = await prisma.vendorReview.findMany({
      where: {
        vendorProfile: {
          vendorId: vendor.id,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reviews);
  } else {
    const reviews = await prisma.review.findMany({
      where: {
        product: {
          vendorId: vendor.id,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reviews);
  }
}
