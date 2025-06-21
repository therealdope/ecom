import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'VENDOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();
  const vendor = await prisma.vendor.findUnique({
    where: { id: session.user.id },
  });

  if (!vendor || !await bcrypt.compare(currentPassword, vendor.password)) {
    return NextResponse.json({ error: 'Invalid current password' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.vendor.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return NextResponse.json({ message: 'Password updated' });
}
