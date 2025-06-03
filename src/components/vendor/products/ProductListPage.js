import React, { useState, useMemo, useEffect, Suspense } from 'react';
import {
  FaFilter,
  FaArrowUp,
  FaArrowDown,
  FaEdit,
  FaTrash,
  FaChevronLeft
} from 'react-icons/fa';
import EditProductForm from './EditProductForm';
import ProductSkeletonLoader from './ProductSkeletonLoader';
import Image from 'next/image';


export default function ProductListPage({ products = [], onUpdate }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [shopFilter, setShopFilter] = useState([]);
  const [stockFilter, setStockFilter] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 10;

  useEffect(() => {
    // Simulate loading state for smoother transitions
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [products]);

  const categories = useMemo(() => (
    Array.from(new Set(products.map(p => p.category?.name).filter(Boolean)))
  ), [products]);

  const shops = useMemo(() => (
    Array.from(new Set(products.map(p => p.shop?.name).filter(Boolean)))
  ), [products]);

  const getFirstVariant = (product) => product.variants?.[0] || null;

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const variant = getFirstVariant(product);
      if (!variant) return false;

      if (categoryFilter.length > 0 && !categoryFilter.includes(product.category?.name)) return false;
      if (shopFilter.length > 0 && !shopFilter.includes(product.shop?.name)) return false;
      if (stockFilter === 'in' && variant.stock <= 0) return false;
      if (stockFilter === 'out' && variant.stock > 0) return false;
      if (priceMin && variant.price < parseFloat(priceMin)) return false;
      if (priceMax && variant.price > parseFloat(priceMax)) return false;
      if (dateFrom && new Date(product.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(product.createdAt) > new Date(dateTo)) return false;

      return true;
    });
  }, [products, categoryFilter, shopFilter, stockFilter, priceMin, priceMax, dateFrom, dateTo]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    sorted.sort((a, b) => {
      let aVal, bVal;

      if (sortField === 'price' || sortField === 'stock') {
        aVal = getFirstVariant(a)?.[sortField] ?? 0;
        bVal = getFirstVariant(b)?.[sortField] ?? 0;
      } else if (sortField === 'category') {
        aVal = a.category?.name?.toLowerCase() ?? '';
        bVal = b.category?.name?.toLowerCase() ?? '';
      } else if (sortField === 'shop') {
        aVal = a.shop?.name?.toLowerCase() ?? '';
        bVal = b.shop?.name?.toLowerCase() ?? '';
      } else if (sortField === 'createdAt') {
        aVal = new Date(a.createdAt);
        bVal = new Date(b.createdAt);
      } else {
        aVal = a[sortField]?.toString().toLowerCase() ?? '';
        bVal = b[sortField]?.toString().toLowerCase() ?? '';
      }

      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      return 0;
    });
    return sorted;
  }, [filteredProducts, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [totalPages]);

  const handleCategoryChange = (cat) => {
    setCurrentPage(1);
    setCategoryFilter(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleShopChange = (shop) => {
    setCurrentPage(1);
    setShopFilter(prev =>
      prev.includes(shop) ? prev.filter(s => s !== shop) : [...prev, shop]
    );
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/vendor/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] rounded-lg">
      <div className="flex-1 p-1 overflow-hidden relative">
        <div className="flex justify-end items-center mb-6 gap-4">
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
            <select
              value={sortField}
              onChange={e => setSortField(e.target.value)}
              className="text-base px-4 py-2 border-r border-gray-200 focus:outline-none text-gray-700 bg-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="createdAt">Sort by Date</option>
              <option value="stock">Sort by Stock</option>
              <option value="category">Sort by Category</option>
              <option value="shop">Sort by Shop</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
              title="Toggle Order"
            >
              {sortOrder === 'asc' ? <FaArrowUp size={16} /> : <FaArrowDown size={16} />}
            </button>
          </div>
          {!isFilterOpen && (
            <button 
              onClick={() => setIsFilterOpen(true)} 
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <FaFilter className="text-gray-600" size={16} />
              <span className="text-base text-gray-700">Filters</span>
            </button>
          )}
        </div>

        <div className="w-full overflow-x-auto rounded-lg shadow-sm bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Shop</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
              // Show 5 skeleton loaders while loading
              [...Array(3)].map((_, index) => (
                <ProductSkeletonLoader key={index} />
              ))
            ) : 
              (paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-base text-gray-500">No products found.</td>
                </tr>
              ) : paginatedProducts.map(product => {
                const variant = getFirstVariant(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={product.imageUrl} 
                            alt={product.name}
                            key={product.id}
                            className="w-full h-full object-cover"
                            width={100}
                            height={100}
                          />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-base font-medium text-gray-900">{product.name}</h3>
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{product.category?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{product.shop?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600 text-right">{variant?.stock ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600 text-right">{variant?.price?.toFixed(2) ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{new Date(product.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button onClick={() => setEditingProduct(product)} className="text-indigo-500 hover:text-indigo-600 mx-2" title="Edit"><FaEdit size={18} /></button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-600 mx-2" title="Delete"><FaTrash size={18} /></button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-between items-center p-2 rounded-lg">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            className="px-4 py-2 text-base rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-base font-medium rounded-lg text-indigo-600/70 px-4 py-2">Page {currentPage} of {totalPages || 1}</span>
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            className="px-4 py-2 text-base rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaChevronLeft size={20} />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Category</h3>
              {categories.map(cat => (
                <label key={cat} className="flex items-center py-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={categoryFilter.includes(cat)}
                    onChange={() => handleCategoryChange(cat)}
                  />
                  <span className="ml-3 text-base text-gray-700 group-hover:text-gray-900">{cat}</span>
                </label>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Shop</h3>
              {shops.map(shop => (
                <label key={shop} className="flex items-center py-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={shopFilter.includes(shop)}
                    onChange={() => handleShopChange(shop)}
                  />
                  <span className="ml-3 text-base text-gray-700 group-hover:text-gray-900">{shop}</span>
                </label>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Stock Status</h3>
              {['all', 'in', 'out'].map(status => (
                <label key={status} className="flex items-center py-2 cursor-pointer group">
                  <input
                    type="radio"
                    className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                    checked={stockFilter === status}
                    onChange={() => setStockFilter(status)}
                  />
                  <span className="ml-3 text-base text-gray-700 group-hover:text-gray-900">
                    {status === 'all' ? 'All' : status === 'in' ? 'In Stock' : 'Out of Stock'}
                  </span>
                </label>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Price Range</h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Date Range</h3>
              <div className="space-y-4">
                <input 
                  type="date" 
                  value={dateFrom} 
                  onChange={e => setDateFrom(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
                <input 
                  type="date" 
                  value={dateTo} 
                  onChange={e => setDateTo(e.target.value)} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onProductUpdated={onUpdate}
        />
      )}
    </div>
  );
}