import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'VENDOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: session.user.id },
    include: {
      profile: {
        include: { reviews: true }
      },
    },
  });

  return NextResponse.json(vendor);
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'VENDOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();

  const updateData = {};
  if (data.name) updateData.name = data.name;

  await prisma.vendor.update({
    where: { id: session.user.id },
    data: updateData,
  });

  await prisma.vendorProfile.upsert({
    where: { vendorId: session.user.id },
    update: {
      phoneNumber: data.phoneNumber,
      storeName: data.storeName,
      description: data.description,
      businessAddress: data.businessAddress,
      bankDetails: data.bankDetails,
    },
    create: {
      vendorId: session.user.id,
      phoneNumber: data.phoneNumber || '',
      storeName: data.storeName || 'My Store',
      description: data.description || '',
      businessAddress: data.businessAddress || '',
      bankDetails: data.bankDetails || '',
    },
  });

  const updated = await prisma.vendor.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  return NextResponse.json(updated);
}
