import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.cartItem.deleteMany({
      where: {
        userId: session.user.id
      }
    });

    return NextResponse.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('Clear cart error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
