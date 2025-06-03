import { useState, useEffect,useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function EditProductForm({ product, isOpen, onClose, onProductUpdated }) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    category: product.categoryId,
    imageUrl: product.imageUrl,
    variants: product.variants.map(v => ({
      id: v.id,
      size: v.size || '',
      color: v.color || '',
      sku: v.sku,
      price: v.price,
      stock: v.stock
    }))
  });

  const [categories, setCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [errors, setErrors] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sizeUnit, setSizeUnit] = useState('cm');
  const [customSizeUnit, setCustomSizeUnit] = useState('');
  const [colorPickerIndex, setColorPickerIndex] = useState("#");
  const colorInputRefs = useRef({});
  const [imageUpdated, setImageUpdated] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState(product.imageUrl || '');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
// ----------------------------------------------------
  useEffect(() => {
    if (colorPickerIndex !== null && colorInputRefs.current[colorPickerIndex]) {
      // Delay to let the DOM update fully before clicking
      requestAnimationFrame(() => {
        setTimeout(() => {
          colorInputRefs.current[colorPickerIndex]?.click();
        }, 0); // Or increase to 50ms if needed
      });
    }
  }, [colorPickerIndex]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsSearching(true);
      try {
        const response = await fetch('/api/vendor/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsSearching(false);
      }
    };
    fetchCategories();
    
  }, []);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/api/vendor/categories/${product.categoryId}`);
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({ ...prev, category: data.name }));
          setCategorySearch(data.name);
        } else {
          console.error('Error fetching category:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    };
    fetchCategory();
  }, [product.categoryId]);
  

  const getFilteredCategories = () => {
    if (!categorySearch) return [];
    return categories.filter(category =>
      category.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  };

  const handleSelectCategory = (name) => {
    setFormData({ ...formData, category: name });
    setCategorySearch(name);
    setSelectedCategory(name);
  };

  const handleCreateCategory = () => {
    const trimmed = categorySearch.trim();
    if (!trimmed) return;
    handleSelectCategory(trimmed);
  };

  const handleCategorySearch = (value) => {
    setCategorySearch(value);
    setFormData({ ...formData, category: '' });
  };

  const renderCategorySelection = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Category <span className="text-red-500">*</span>
      </label>
  
      <div className="relative">
        <input
          type="text"
          placeholder="Search or create category"
          value={categorySearch}
          onChange={(e) => handleCategorySearch(e.target.value)}
          disabled={!!formData.category}
          className="w-full rounded-lg border px-4 py-3 pr-10 bg-white"
        />
  
        {/* Remove icon */}
        {formData.category && (
          <button
            type="button"
            onClick={() => {
              setFormData({ ...formData, category: '' });
              setCategorySearch('');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
  
        {/* Loading spinner */}
        {isSearching && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
      </div>
  
      {/* Filtered categories list */}
      {!formData.category && getFilteredCategories().length > 0 && (
        <ul className="mt-2 max-h-40 overflow-auto border rounded-md shadow-sm">
          {getFilteredCategories().map((category) => (
            <li
              key={category.id}
              className="flex justify-between items-center cursor-pointer p-2 hover:bg-gray-50"
            >
              <span
                onClick={() => {
                  setFormData({ ...formData, category: category.name });
                  setCategorySearch(category.name);
                }}
                className="flex-grow"
              >
                {category.name}
              </span>
            </li>
          ))}
        </ul>
      )}
  
      {/* Create new category if no match */}
      {!formData.category &&
        categorySearch &&
        getFilteredCategories().length === 0 && (
          <button
            type="button"
            onClick={handleCreateCategory}
            className="mt-2 w-full py-2 px-4 text-sm text-blue-600 hover:bg-blue-50 rounded-md border border-blue-200"
          >
            Create new category &quot;{categorySearch}&quot;
          </button>
        )}
  
      {/* Validation error */}
      {errors.category && (
        <p className="mt-1 text-sm text-red-600">{errors.category}</p>
      )}
    </div>
  );

// ----------------------------------------------------

  const handleImageUpload = async (file) => {
    if (!file) return '';

    const formDataCloud = new FormData();
    formDataCloud.append('file', file);
    formDataCloud.append('folder', 'products');

    try {
      setIsLoading(true);
      const response = await fetch(`/api/cloudinary/update?oldImageUrl=${encodeURIComponent(originalImageUrl)}`, {
        method: 'POST',
        body: formDataCloud,
      });

      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          imageUrl: data.secure_url,
        }));
        setOriginalImageUrl(data.secure_url);
        return data.secure_url; // ⬅ return URL
      } else {
        console.error('Upload error:', data.error);
        return '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return '';
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let uploadedImageUrl = formData.imageUrl;

      // Step 1: Upload image to Cloudinary if needed
      if (imageUpdated && selectedImageFile) {
        uploadedImageUrl = await handleImageUpload(selectedImageFile); // returns secure_url
        setImageUpdated(false);
      }

      // Step 2: Send form with correct Cloudinary image URL
      const response = await fetch(`/api/vendor/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imageUrl: uploadedImageUrl,
        }),
      });

      if (response.ok) {
        onProductUpdated();
        onClose();
      } else {
        console.error('Failed to update product:', await response.text());
      }
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this state for drag and drop functionality
  const [isDragging, setIsDragging] = useState(false);
          
  // Add these handlers for drag and drop
  const handleDragEnter = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const localUrl = URL.createObjectURL(file);
      setSelectedImageFile(file);
      setFormData((prev) => ({ ...prev, imageUrl: localUrl }));
      setImageUpdated(true); // Mark that image has changed
    }
  };
  

  const handleRemoveVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };
  
  const handleVariantChange = (index, field, value) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return { ...prev, variants: newVariants };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="mx-auto my-12 w-full max-w-4xl bg-white rounded-2xl p-6 shadow-xl">

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Edit Product</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="">
            {renderCategorySelection()}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Product Image</label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
                isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                {formData.imageUrl ? (
                  <div className="relative group">
                    <Image
                      src={formData.imageUrl}
                      alt="Product image"
                      width={200}
                      height={200}
                      className="rounded-lg object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="text-white p-2 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                    <p className="mt-1 text-sm text-gray-500">Drag and drop an image here, or</p>
                  </div>
                )}
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const localUrl = URL.createObjectURL(file);
                        setSelectedImageFile(file);
                        setFormData((prev) => ({ ...prev, imageUrl: localUrl }));
                        setImageUpdated(true);
                      }
                    }}
                    
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-indigo-200 hover:text-indigo-600 transition"
                  >
                    {formData.imageUrl ? 'Change Image' : 'Select Image'}
                  </button>
                </div>
              </div>
            </div>
          </div>



          <div className="space-y-6 p-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Product Variants <span className="text-red-500">*</span></h3>
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  variants: [...prev.variants, { size: '', color: '', sku: '', price: '', stock: '' }]
                }))}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 5a1 1 0 011 1v3h3a1 1 0 010 2h-3v3a1 1 0 01-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                </svg>
                Add Variant
              </button>
            </div>

            {formData.variants.map((variant, index) => (
              <div key={index} className="border-1 rounded-xl p-6 shadow-md bg-white space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="text-lg font-medium">Variant {index + 1}</h4>
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      className="text-gray-400 hover:text-red-500 transition p-1 rounded-full hover:bg-red-50"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Size Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold">Size</label>
                    <div className="flex space-x-2 items-center">
                      <input
                        type="text"
                        placeholder="Size"
                        value={variant.size.split(/[a-zA-Z]+/)[0] || ''}
                        onChange={(e) => {
                          const newSize = e.target.value + (sizeUnit === 'custom' ? customSizeUnit : sizeUnit);
                          handleVariantChange(index, 'size', newSize);
                        }}
                        className="flex-1 border rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <select
                        value={sizeUnit}
                        onChange={(e) => setSizeUnit(e.target.value)}
                        className="border rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {['cm', 'in', 'custom'].map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                    {sizeUnit === 'custom' && (
                      <input
                        type="text"
                        placeholder="Custom unit (e.g. yards)"
                        value={customSizeUnit}
                        onChange={(e) => setCustomSizeUnit(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>

                    {/* Color Input with Inline Preview and Picker */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Color (Hex)</label>
                      <div className="flex items-center space-x-3 relative">
                        {/* Text input for hex value */}
                        <input
                          type="text"
                          placeholder="#RRGGBB"
                          value={variant.color}
                          onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                          className="flex-1 border border-black rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />

                        {/* Color preview with inline color input */}
                        <div className="relative">
                          <div
                            className="w-10 h-10 rounded-lg border border-black cursor-pointer"
                            style={{ backgroundColor: /^#([0-9A-F]{3}){1,2}$/i.test(variant.color) ? variant.color : '#ffffff' }}
                            onClick={() => setColorPickerIndex(index)}
                            title="Click to pick color"
                          />
                          {colorPickerIndex === index && (
                            <input
                              type="color"
                              ref={(el) => (colorInputRefs.current[index] = el)}
                              value={variant.color || '#000000'}
                              onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                              className="absolute top-0 left-0 w-10 h-10 opacity-0 cursor-pointer"
                              onBlur={() => setColorPickerIndex(null)}
                            />
                          )}
                        </div>
                      </div>

                      {/* Optional invalid warning */}
                      {!/^#([0-9A-F]{3}){1,2}$/i.test(variant.color) && variant.color && (
                        <p className="text-xs text-red-500">Invalid hex code</p>
                      )}
                    </div>

                  {/* SKU */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold">SKU</label>
                    <input
                      type="text"
                      placeholder="Stock Keeping Unit"
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold">Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                        className="w-full border rounded-lg pl-8 pr-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold">Stock</label>
                    <input
                      type="number"
                      placeholder="Quantity in stock"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-400"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}