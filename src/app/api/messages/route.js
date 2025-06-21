import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, recipientId, isVendor, chatId } = body;

    if (!content || typeof isVendor !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let resolvedChatId = chatId;

    // If no chatId is provided, try to create or find one
    if (!resolvedChatId) {
      if (!recipientId) {
        return NextResponse.json({ error: 'recipientId or chatId required' }, { status: 400 });
      }

      const isUserSender = !isVendor;
      const userId = isUserSender ? session.user.id : recipientId;
      const vendorId = isUserSender ? recipientId : session.user.id;

      const chat = await prisma.chat.upsert({
        where: {
          userId_vendorId: {
            userId,
            vendorId
          }
        },
        create: {
          userId,
          vendorId
        },
        update: {
          updatedAt: new Date()
        }
      });

      resolvedChatId = chat.id;
    }

    const message = await prisma.message.create({
      data: {
        chatId: resolvedChatId,
        content,
        senderId: session.user.id,
        isVendor
      }
    });

    return NextResponse.json({ chatId: resolvedChatId, message });
  } catch (error) {
    console.error('Chat creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
