import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'VENDOR') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const { orderId } = await req.json();

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { vendor: true, user: true },
        });

        if (!order) {
            return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
        }

        if (order.vendorId !== session.user.id) {
            return new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 });
        }

        if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
            return new Response(
                JSON.stringify({ error: 'Cannot cancel a delivered or already cancelled order' }), { status: 400 }
            );
        }

        // Fetch order items
        const orderItems = await prisma.orderItem.findMany({
            where: { orderId },
            select: {
                variantId: true,
                quantity: true,
            },
        });

        // Update order status
        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
        });

        // Restore stock and mark inOrder as 2
        await prisma.$transaction(
            orderItems.map((item) =>
                prisma.productVariant.update({
                    where: { id: item.variantId },
                    data: {
                        stock: { increment: item.quantity },
                        inOrder: 2,
                    },
                })
            )
        );

        // Notify user
        await prisma.userNotification.create({
            data: {
                userId: order.userId,
                content: `Your order ${orderId} was cancelled by the vendor.`,
                type: 'ORDER_CANCELLED',
            },
        });

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Cancel Order Error:', error);
        return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
    }
}