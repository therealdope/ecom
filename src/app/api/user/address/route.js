import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      addresses: {
        orderBy: { isDefault: 'desc' }
      }
    }
  });

  return NextResponse.json(profile?.addresses || []);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { street, city, state, country, zipCode, isDefault } = await req.json();
  const profile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } });
  const userProfile = profile || await prisma.userProfile.create({ data: { userId: session.user.id } });

  const address = await prisma.address.create({
    data: {
      userProfileId: userProfile.id,
      street, city, state, country, zipCode,
      isDefault: !!isDefault
    }
  });

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userProfileId: userProfile.id, id: { not: address.id } },
      data: { isDefault: false }
    });
  }

  return NextResponse.json(address);
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id, street, city, state, country, zipCode, isDefault } = await req.json();
  const updated = await prisma.address.update({
    where: { id },
    data: { street, city, state, country, zipCode, isDefault: !!isDefault }
  });

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userProfileId: updated.userProfileId, id: { not: id } },
      data: { isDefault: false }
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
