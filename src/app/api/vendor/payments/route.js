import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ payments: [] }, { status: 401 });

  const payments = await prisma.payment.findMany({
    where: { vendorId: session.user.id },
    include: { order: true, user: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ payments });
}
