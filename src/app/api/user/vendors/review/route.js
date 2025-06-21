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

  const vendorProfile = await prisma.vendorProfile.findUnique({
    where: {
      vendorId,
    },
    select: { id: true },
  })

  if (!vendorProfile) {
    return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
  }

  await prisma.vendorReview.create({
    data: {
      vendorProfile: { connect: { id: vendorProfile.id } },
      userId: session.user.id,
      rating: Number(rating),
      comment: comment || '',
    },
  })

  return NextResponse.json({ success: true })
}
