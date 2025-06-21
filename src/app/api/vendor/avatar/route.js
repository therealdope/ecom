import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'VENDOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { logo } = await req.json();

  await prisma.vendorProfile.update({
    where: { vendorId: session.user.id },
    data: { logo },
  });

  return NextResponse.json({ message: 'Logo updated' });
}
