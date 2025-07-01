import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'VENDOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendor = await prisma.vendorProfile.findUnique({
    where: { vendorId: session.user.id },
    select: { logo: true },
  });

  return NextResponse.json({ logo: vendor?.logo });

}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'VENDOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { logo } = await req.json();

  await prisma.vendorProfile.upsert({
    where: { vendorId: session.user.id },
    update: { logo },
    create: {
      vendorId: session.user.id,
      logo,
    },
  });

  return NextResponse.json({ message: 'Logo updated' });
}

