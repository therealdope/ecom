'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useShop } from '@/context/ShopContext';
import VendorLayout from '@/components/vendor/layout/VendorLayout';
import AddProductForm from '@/components/vendor/products/AddProductForm';
import ProductListPage from '@/components/vendor/products/ProductListPage';
import ProductMainPageSkeletonLoader from '@/components/vendor/products/ProductMainPageSkeletonLoader';

export default function VendorProducts() {
  const { data: session, status } = useSession();
  const { selectedShop } = useShop();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

const fetchProducts = useCallback(async () => {
  try {
    setIsLoading(true);
    const response = await fetch(`/api/vendor/products?shopId=${selectedShop.id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    setProducts(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Error fetching products:', error);
    setProducts([]);
  } finally {
    setIsLoading(false);
  }
}, [selectedShop?.id]);

useEffect(() => {
  if (selectedShop?.id) {
    fetchProducts();
  } else {
    setProducts([]);
    setIsLoading(false);
  }
}, [selectedShop, fetchProducts]);


  if (status === 'loading' || isLoading) {
    return (
      <VendorLayout>
        <div className="flex justify-center text-center">
          <ProductMainPageSkeletonLoader />
        </div>
      </VendorLayout>
    );
  }

  if (!selectedShop) {
    return (
      <VendorLayout>
        <div className="p-6 text-center text-gray-500">
          Please select a shop to view products
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Products - {selectedShop.name}</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Add New Product
          </button>
        </div>

        <ProductListPage products={products} onUpdate={fetchProducts} />

        {isAddModalOpen && (
          <AddProductForm
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onProductAdded={fetchProducts}
            shopId={selectedShop.id}
          />
        )}
      </div>
    </VendorLayout>
  );
}
