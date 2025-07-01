import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@lib/prisma';


export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const { id } = params;
    if (!id) return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });

    const data = await request.json();
    const { name, description, categoryId, category, variants: formVariants, imageUrl } = data;

    const product = await prisma.product.findFirst({
      where: { id, vendorId: session.user.id },
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 });
    }

    // ✅ Get category
    let categoryRecord;
    if (categoryId) {
      categoryRecord = await prisma.productCategory.findUnique({ where: { id: categoryId } });
      if (!categoryRecord) return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    } else if (category) {
      categoryRecord = await prisma.productCategory.upsert({
        where: { name: category.trim() },
        update: {},
        create: { name: category.trim() },
      });
    } else {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const dbVariants = await prisma.productVariant.findMany({ where: { productId: id } });

    const formVariantMap = new Map(formVariants.map((v) => [v.id, v]));

    const toDeleteIds = [];
    const toUpdateTo1Ids = [];
    const toCreate = [];

    // ✅ Step 1: handle DB variants not in form
    for (const db of dbVariants) {
      if (!formVariantMap.has(db.id)) {
        if (db.inOrder === 2) {
          toDeleteIds.push(db.id);
        } else if (db.inOrder === 3) {
          toUpdateTo1Ids.push(db.id);
        }
      }
    }

    // ✅ Step 2: handle form variants
    for (const formVariant of formVariants) {
      const match = dbVariants.find((db) => db.id === formVariant.id);
      if (!match) {
        toCreate.push({ ...formVariant, inOrder: 2 });
        continue;
      }

      const isSame =
        match.sku === formVariant.sku &&
        match.size === formVariant.size &&
        match.color === formVariant.color &&
        parseFloat(match.price) === parseFloat(formVariant.price) &&
        parseInt(match.stock) === parseInt(formVariant.stock);

      if (isSame) continue;

      if (match.inOrder === 2) {
        toDeleteIds.push(match.id);
        toCreate.push({ ...formVariant, inOrder: 2 });
      } else if (match.inOrder === 3) {
        toUpdateTo1Ids.push(match.id);
        toCreate.push({ ...formVariant, inOrder: 2 });
      }
    }

    // ✅ Execute DB operations
    await prisma.$transaction(async (tx) => {
      if (toUpdateTo1Ids.length) {
        await tx.productVariant.updateMany({
          where: { id: { in: toUpdateTo1Ids } },
          data: { inOrder: 1 },
        });
      }

      if (toDeleteIds.length) {
        await tx.productVariant.deleteMany({
          where: { id: { in: toDeleteIds } },
        });
      }

      if (toCreate.length) {
  await Promise.all(
    toCreate.map((v) =>
      tx.productVariant.create({
        data: {
          productId: id,
          size: v.size,
          color: v.color,
          sku: v.sku,
          price: parseFloat(v.price),
          stock: parseInt(v.stock),
          inOrder: 2,
        },
      })
    )
  );
}


      await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          imageUrl: imageUrl?.trim() || '',
          categoryId: categoryRecord.id,
        },
      });
    });

    return NextResponse.json({ message: 'Product and variants updated successfully' }, { status: 200 });
  } catch (err) {
    console.error('Update product error:', err);
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 });
  }
}

//Delete product
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Missing product ID in URL' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: { vendorId: true }
    });

    if (!product || product.vendorId !== session.user.id) {
      return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 });
    }

    // ⚠️ Skip order item check: we are force deleting even if product was used

    // Proceed with deletion
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { productId: id } }), // Remove order items first if needed
      prisma.productVariant.deleteMany({ where: { productId: id } }),
      prisma.cartItem.deleteMany({ where: { productId: id } }),
      prisma.wishlistItem.deleteMany({ where: { productId: id } }),
      prisma.review.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } })
    ]);

    return NextResponse.json({ message: 'Product and related data deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Error deleting product: ' + error.message }, { status: 500 });
  }
}