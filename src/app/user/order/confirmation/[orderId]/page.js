import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import UserDashboardLayout from '@/components/user/layout/UserDashboardLayout';

export default async function OrderConfirmationPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const order = await prisma.order.findUnique({
    where: {
      id: params.orderId,
    },
    include: {
      orderItems: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  if (!order || order.userId !== session.user.id) {
    return (
      <div className="text-center text-red-500 mt-10">
        Order not found or you don’t have permission to view it.
      </div>
    );
  }

  return (
    <UserDashboardLayout>
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">🎉 Order Confirmed!</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <p className="text-gray-700">Thank you for your order, <b>{session.user.name}</b>!</p>
        <p className="text-sm text-gray-600">
          <strong>Order ID:</strong> {order.id}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Status:</strong> {order.status}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Shipping To:</strong> {order.address}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Total:</strong> ₹{order.total.toFixed(2)}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Payment Method:</strong> {order.paymentMethod}
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">🛍 Order Items</h3>
        <div className="space-y-3">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex justify-between bg-gray-100 p-4 rounded">
              <div>
                <p className="font-medium text-gray-800">{item.product.name}</p>
                {item.variant && (
                  <p className="text-sm text-gray-500">
                    Variant: {item.variant.size || 'N/A'} {item.variant.color ? `- ${item.variant.color}` : ''} {item.variant.price ? `(₹${item.variant.price.toFixed(2)})` : ''}
                  </p>
                )}
              </div>
              <div>
                <p className="text-gray-700">Qty: {item.quantity}</p>
                <p className="text-gray-700">₹{item.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 text-center">
        <a href="/user/orders" className="text-indigo-600 hover:underline">
          📦 View My Orders
        </a>
      </div>
    </div>
    </UserDashboardLayout>
  );
}
