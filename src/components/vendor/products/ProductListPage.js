import React, { useState, useMemo, useEffect,useRef } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const filterRef = useRef(null);
  const [categorySearch, setCategorySearch] = useState('');
const [shopSearch, setShopSearch] = useState('');

  const itemsPerPage = 7;

useEffect(() => {
  setIsLoading(true);
  const timer = setTimeout(() => setIsLoading(false), 200); // shorter, smoother
  return () => clearTimeout(timer);
}, [products, sortField, sortOrder]);

  const categories = useMemo(() => (
    Array.from(new Set(products.map(p => p.category?.name).filter(Boolean)))
  ), [products]);

  const shops = useMemo(() => (
    Array.from(new Set(products.map(p => p.shop?.name).filter(Boolean)))
  ), [products]);

  const getFirstVariant = (product) =>
  product.variants?.find((v) => v.inOrder !== 1) || null;


  useEffect(() => {
  const handleClickOutside = (event) => {
    if (filterRef.current && !filterRef.current.contains(event.target)) {
      setIsFilterOpen(false);
    }
  };

  if (isFilterOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isFilterOpen]);


  const filteredProducts = useMemo(() => {
  return products.filter(product => {
    const variant = getFirstVariant(product);
    if (!variant) return false;

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      product.name.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      product.category?.name?.toLowerCase().includes(searchLower) ||
      product.shop?.name?.toLowerCase().includes(searchLower)
    );

    const categoryMatch = categoryFilter.length === 0 || categoryFilter.includes(product.category?.name);
    const shopMatch = shopFilter.length === 0 || shopFilter.includes(product.shop?.name);
const stockMatch = 
  stockFilter === 'all' ||
  (stockFilter === 'in' && variant.stock > 3) ||
  (stockFilter === 'low' && variant.stock > 0 && variant.stock <= 3) ||
  (stockFilter === 'out' && variant.stock <= 0);
    const priceMatch = (!priceMin || variant.price >= parseFloat(priceMin)) &&
      (!priceMax || variant.price <= parseFloat(priceMax));
    const dateMatch = (!dateFrom || new Date(product.createdAt) >= new Date(dateFrom)) &&
      (!dateTo || new Date(product.createdAt) <= new Date(dateTo));

    return matchesSearch && categoryMatch && shopMatch && stockMatch && priceMatch && dateMatch;
  });
}, [products, searchQuery, categoryFilter, shopFilter, stockFilter, priceMin, priceMax, dateFrom, dateTo]);

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
    <div className="min-h-[calc(100vh-16rem)] p-4 relative bg-gray-50 rounded-xl">
  {/* Search + Sort + Filter Bar */}
  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
    <input
      type="text"
      placeholder="Search products..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full md:max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />

    <div className="flex gap-2 flex-wrap justify-end">
      {/* Sort Dropdown */}
      <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <select
          value={sortField}
          onChange={e => setSortField(e.target.value)}
          className="text-sm px-4 py-2 border-r border-gray-200 text-gray-700 bg-white focus:outline-none"
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
          className="px-3 py-2 text-gray-600 hover:bg-gray-50"
          title="Toggle Order"
        >
          {sortOrder === 'asc' ? <FaArrowUp size={14} /> : <FaArrowDown size={14} />}
        </button>
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setIsFilterOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 shadow-sm"
      >
        <FaFilter className="text-gray-600" size={14} />
        Filters
      </button>
    </div>
  </div>

  {/* Product Table */}
  <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm">
    <table className="min-w-full divide-y divide-gray-200 text-sm">
      <thead className="bg-gray-100 text-gray-600 font-semibold uppercase">
        <tr>
          <th className="px-6 py-4 text-left">Name</th>
          <th className="px-6 py-4 text-left">Category</th>
          <th className="px-6 py-4 text-left">Shop</th>
          <th className="px-6 py-4 text-right">Stock</th>
          <th className="px-6 py-4 text-right">Price (₹)</th>
          <th className="px-6 py-4 text-left">Date</th>
          <th className="px-6 py-4 text-center">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {isLoading ? (
          [...Array(3)].map((_, index) => <ProductSkeletonLoader key={index} />)
        ) : paginatedProducts.length === 0 ? (
          <tr>
            <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No products found.</td>
          </tr>
        ) : paginatedProducts.map(product => {
          const variant = getFirstVariant(product);
          return (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      width={64}
                      height={64}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-700">{product.category?.name}</td>
              <td className="px-6 py-4 text-gray-700">{product.shop?.name}</td>
              <td className="px-6 py-4 text-right text-gray-700">{variant?.stock ?? '-'}</td>
              <td className="px-6 py-4 text-right text-gray-700">{variant?.price?.toFixed(2) ?? '-'}</td>
              <td className="px-6 py-4 text-gray-700">{new Date(product.createdAt).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-center">
                <button onClick={() => setEditingProduct(product)} className="text-indigo-500 hover:text-indigo-600 mx-2" title="Edit">
                  <FaEdit size={16} />
                </button>
                <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-600 mx-2" title="Delete">
                  <FaTrash size={16} />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>

  {/* Pagination */}
  <div className="mt-6 flex justify-between items-center">
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
      className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
    >
      Previous
    </button>
    <span className="text-sm text-indigo-700 font-medium">
      Page {currentPage} of {totalPages || 1}
    </span>
    <button
      disabled={currentPage === totalPages || totalPages === 0}
      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
      className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
    >
      Next
    </button>
  </div>

  {/* Edit Modal */}
  {editingProduct && (
    <EditProductForm
      product={editingProduct}
      isOpen={!!editingProduct}
      onClose={() => setEditingProduct(null)}
      onProductUpdated={onUpdate}
    />
  )}

  {/* Filter Panel */}
  {isFilterOpen && (
  <div
  ref={filterRef}
  className="fixed top-[117px] md:top-[64px] right-0 w-full md:w-80 h-[calc(100vh-117px)] md:h-[calc(100vh-64px)] bg-white shadow-xl overflow-y-auto border-t border-gray-200 transition-all duration-300 p-5 space-y-6 text-sm text-gray-700"
>

    {/* Header */}
    <div className="flex justify-between items-center border-b pb-4">
      <h2 className="text-base font-semibold text-gray-800">Filters</h2>
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            // Reset all filters
            setCategoryFilter([]);
            setShopFilter([]);
            setStockFilter('all');
            setPriceMin('');
            setPriceMax('');
            setDateFrom('');
            setDateTo('');
          }}
          className="text-xs text-red-600 hover:underline"
        >
          Clear All
        </button>
        <button
          onClick={() => setIsFilterOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaChevronLeft size={18} />
        </button>
      </div>
    </div>

    {/* Category Filter */}
    <div className="space-y-2">
      <label className="block font-medium">Category</label>
      <input
        type="text"
        placeholder="Search categories..."
        value={categorySearch}
        onChange={(e) => setCategorySearch(e.target.value)}
        className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-indigo-500"
      />
      <div className="max-h-39 overflow-y-auto space-y-1 pr-1 scroll-smooth min-h-[3rem]">
        {categories
          .filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase()))
          .map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
              <input
                type="checkbox"
                className="accent-indigo-600 w-4 h-4"
                checked={categoryFilter.includes(cat)}
                onChange={() => handleCategoryChange(cat)}
              />
              <span>{cat}</span>
            </label>
          ))}
      </div>
    </div>

    {/* Shop Filter */}
    <div className="space-y-2">
      <label className="block font-medium">Shop</label>
      <input
        type="text"
        placeholder="Search shops..."
        value={shopSearch}
        onChange={(e) => setShopSearch(e.target.value)}
        className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-indigo-500"
      />
      <div className="max-h-39 overflow-y-auto space-y-1 pr-1 scroll-smooth min-h-[3rem]">
        {shops
          .filter(shop => shop.toLowerCase().includes(shopSearch.toLowerCase()))
          .map(shop => (
            <label key={shop} className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
              <input
                type="checkbox"
                className="accent-indigo-600 w-4 h-4"
                checked={shopFilter.includes(shop)}
                onChange={() => handleShopChange(shop)}
              />
              <span>{shop}</span>
            </label>
          ))}
      </div>
    </div>

    {/* Stock Status */}
    <div className="space-y-2">
      <label className="block font-medium">Stock Status</label>
      {['all', 'in', 'out', 'low'].map(status => (
        <label key={status} className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
          <input
            type="radio"
            className="accent-indigo-600 w-4 h-4"
            checked={stockFilter === status}
            onChange={() => setStockFilter(status)}
          />
          <span>
            {{
              all: 'All',
              in: 'In Stock',
              out: 'Out of Stock',
              low: 'Low Stock (≤3)',
            }[status]}
          </span>
        </label>
      ))}
    </div>

    {/* Price Filter */}
    <div className="space-y-2">
      <label className="block font-medium">Price Range (₹)</label>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Min"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-indigo-500"
        />
        <input
          type="number"
          placeholder="Max"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-indigo-500"
        />
      </div>
    </div>

    {/* Date Filter */}
    <div className="space-y-2">
      <label className="block font-medium">Date Range</label>
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-indigo-500"
      />
      <input
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-indigo-500"
      />
    </div>
  </div>
)}

</div>

  );
}