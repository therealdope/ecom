import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Image from 'next/image';
import Link from 'next/link';
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
              <div
                key={item.id}
                className="flex items-start gap-4 bg-white shadow-sm rounded-lg p-4"
              >
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  width={80}
                  height={80}
                  className="rounded object-cover border"
                />
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-gray-800">{item.product.name}</p>
                  {item.variant && (
                    <p className="text-sm text-gray-500">
                      Size: {item.variant.size || 'N/A'} | Color: {item.variant.color || 'N/A'}
                    </p>
                  )}
                  
                </div>
                <div className="flex flex-col">
                <div className="text-right font-semibold text-indigo-700">
                  ₹{item.price.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  Quantity: {item.quantity}
                </div>
                </div>
              </div>
            ))}
          </div>
      </div>

      <div className="mt-10 p-2 text-center flex justify-between">

        <Link href="/user/dashboard">
        <button className='text-white text-lg py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700'>
        Explore more !!
        </button>
        </Link>

        <Link href="/user/orders">
        <button className='text-white text-lg py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700'>
        View My Orders
        </button>
        </Link>
        
      </div>
    </div>
    </UserDashboardLayout>
  );
}
