import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { vendorId, rating, comment } = await req.json()

  if (!vendorId || !rating) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // First check if vendor exists
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId }
  })

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
  }

  const vendorProfile = await prisma.vendorProfile.upsert({
    where: { vendorId },
    create: {
      vendorId,
      storeName: vendor.name,
      businessAddress: vendor.address || 'Not provided' // Add default business address
    },
    update: {},
    select: { id: true }
  })

  await prisma.vendorReview.create({
    data: {
      vendorProfile: { connect: { id: vendorProfile.id } },
      user: { connect: { id: session.user.id } },
      rating: Number(rating),
      comment: comment || ''
    }
  })

  return NextResponse.json({ success: true })
}
