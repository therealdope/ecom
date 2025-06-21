import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: {
        include: { addresses: true }
      }
    }
  });
  return NextResponse.json(user);
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { name, phoneNumber, avatar } = await req.json();
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      profile: {
        upsert: {
          create: { phoneNumber, avatar },
          update: { phoneNumber, avatar }
        }
      }
    },
    include: { profile: true }
  });
  return NextResponse.json(user);
}
