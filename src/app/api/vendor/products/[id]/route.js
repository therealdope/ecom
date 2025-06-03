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
      if (!id) {
        return NextResponse.json({ error: 'Missing product ID in URL' }, { status: 400 });
      }
  
      const data = await request.json();
      const { name, description, categoryId, category, variants, imageUrl } = data;
  
      // Fetch the product and verify vendor owns it
      const product = await prisma.product.findFirst({
        where: {
          id,
          vendorId: session.user.id
        }
      });
  
      if (!product) {
        return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 });
      }
  
      // Handle category resolution
      let categoryRecord;
      if (categoryId) {
        categoryRecord = await prisma.productCategory.findUnique({
          where: { id: categoryId }
        });
        if (!categoryRecord) {
          return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
        }
      } else if (category) {
        categoryRecord = await prisma.productCategory.findFirst({
          where: {
            name: {
              equals: category.trim(),
              mode: 'insensitive'
            }
          }
        });
  
        if (!categoryRecord) {
          categoryRecord = await prisma.productCategory.create({
            data: { name: category.trim() }
          });
        }
      } else {
        return NextResponse.json({ error: 'Category ID or new category name is required' }, { status: 400 });
      }
  
      // Transaction: delete old variants, update product, create new variants
      const result = await prisma.$transaction([
        prisma.productVariant.deleteMany({
          where: { productId: id }
        }),
  
        prisma.product.update({
          where: { id },
          data: {
            name,
            description,
            imageUrl: imageUrl?.trim() || '',
            categoryId: categoryRecord.id
          }
        }),
  
        ...variants.map((variant) =>
          prisma.productVariant.create({
            data: {
              productId: id,
              size: variant.size,
              color: variant.color,
              sku: variant.sku,
              price: parseFloat(variant.price),
              stock: parseInt(variant.stock)
            }
          })
        )
      ]);
  
      return NextResponse.json({ message: 'Product updated successfully' }, { status: 200 });
  
    } catch (error) {
      console.error('Error updating product:', error);
      return NextResponse.json({ error: 'Failed to update product: ' + error.message }, { status: 500 });
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

        // Optional: Check product ownership
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product || product.vendorId !== session.user.id) {
            return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 });
        }

        await prisma.$transaction([
            prisma.productVariant.deleteMany({ where: { productId: id } }),
            prisma.cartItem.deleteMany({ where: { productId: id } }),
            prisma.wishlistItem.deleteMany({ where: { productId: id } }),
            prisma.orderItem.deleteMany({ where: { productId: id } }),
            prisma.review.deleteMany({ where: { productId: id } }),
            prisma.product.delete({ where: { id } })
        ]);

        return NextResponse.json({ message: 'Product and related data deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Error deleting product: ' + error.message }, { status: 500 });
    }
}