import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ vendors: [] }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { vendor: { select: { id: true, name: true, createdAt: true } }, payment: true },
  })

  const map = new Map()
  for (const o of orders) {
    const vid = o.vendorId
    if (!map.has(vid)) {
      map.set(vid, {
        vendorId: vid,
        name: o.vendor.name,
        joined: o.vendor.createdAt,
        orderCount: 0,
        totalSpent: 0,
      })
    }
    const e = map.get(vid)
    e.orderCount += 1
    if (o.payment?.[0]?.status === 'PAID') {
      e.totalSpent += o.payment[0].amount
    }
  }

  return NextResponse.json({ vendors: Array.from(map.values()) })
}
