import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useShop } from '@/context/ShopContext';

export default function AddProductForm({ isOpen, onClose, onProductAdded }) {
  const { data: session } = useSession();
  const { selectedShop } = useShop(); // Get selected shop from context
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '', // Change categoryId to category
    imageUrl: '',
    variants: [{ size: '', color: '', sku: '', price: '', stock: '' }]
  });
  const [categories, setCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState('');

  
  // Add useEffect to fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/vendor/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);
  
  // Modified category handling
  const handleCreateCategory = () => {
    if (!categorySearch.trim()) return;
    setFormData({ ...formData, category: categorySearch.trim() });
    setCategorySearch(categorySearch.trim());
  };
  const getFilteredCategories = () => {
    if (!categorySearch) return [];
    return categories.filter(category =>
      category.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  };

  // Add this function to handle category search input changes
  const handleCategorySearch = (value) => {
    setCategorySearch(value);
    setFormData({ ...formData, category: '' });
  };

  // Update the category selection JSX
  const renderCategorySelection = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Category</label>
      {formData.category ? (
        <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
          <span>
            {formData.category}
            <span className="ml-2 text-sm text-gray-500">(New)</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setFormData({ ...formData, category: '' });
              setCategorySearch('');
            }}
            className="text-red-600 hover:text-red-500"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            placeholder="Enter category"
            value={categorySearch}
            onChange={(e) => handleCategorySearch(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {categorySearch && (
            <button
              type="button"
              onClick={handleCreateCategory}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-500"
            >
              + Add
            </button>
          )}
        </div>
      )}
      {!formData.category && getFilteredCategories().length > 0 && (
        <ul className="mt-2 max-h-40 overflow-auto border rounded-md shadow-sm">
          {getFilteredCategories().map((category) => (
            <li
              key={category.id}
              onClick={() => {
                setFormData({ ...formData, category: category.name });
                setCategorySearch(category.name);
              }}
              className="cursor-pointer p-2 hover:bg-gray-50"
            >
              {category.name}
            </li>
          ))}
        </ul>
      )}
      {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
    </div>
  );

  // Update renderStep1 to use the new renderCategorySelection function
  const renderStep1 = () => (
    <div className="space-y-4">
      {/* Product Name and Description fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Product Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-300' : 'border-gray-300'}`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      {/* Category Selection */}
      {renderCategorySelection()}
    </div>
  );

  // Step 3 content
  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Product Variants</h3>
        <button
          type="button"
          onClick={() => setFormData({
            ...formData,
            variants: [...formData.variants, { size: '', color: '', sku: '', price: '', stock: '' }]
          })}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          + Add Variant
        </button>
      </div>
      {formData.variants.map((variant, index) => (
        <div key={index} className="border rounded-md p-4 space-y-3">
          <div className="flex justify-between">
            <h4 className="font-medium">Variant {index + 1}</h4>
            {index > 0 && (
              <button
                type="button"
                onClick={() => handleRemoveVariant(index)}
                className="text-red-600 hover:text-red-500"
              >
                Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Size"
              value={variant.size}
              onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
              className="rounded-md border-gray-300"
            />
            <input
              type="text"
              placeholder="Color"
              value={variant.color}
              onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
              className="rounded-md border-gray-300"
            />
            <input
              type="text"
              placeholder="SKU"
              value={variant.sku}
              onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
              className="rounded-md border-gray-300"
            />
            <input
              type="number"
              placeholder="Price"
              value={variant.price}
              onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
              className="rounded-md border-gray-300"
            />
            <input
              type="number"
              placeholder="Stock"
              value={variant.stock}
              onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
              className="rounded-md border-gray-300"
            />
          </div>
        </div>
      ))}
    </div>
  );

  // Add this function to handle variant changes
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  // Add handleImageChange function
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Add renderStep2 function for image upload
  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Product Image</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {previewImage ? (
              <div className="relative w-40 h-40 mx-auto">
                <Image
                  src={previewImage}
                  alt="Product preview"
                  layout="fill"
                  objectFit="contain"
                  className="rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setSelectedFile(null);
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </>
            )}
          </div>
        </div>
        {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
      </div>
    </div>
  );

  // Add handleSubmit function before the return statement
  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products'); // Specify the products folder

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate current step
      const stepErrors = {};
      
      if (currentStep === 1) {
        if (!formData.name) stepErrors.name = 'Product name is required';
        if (!formData.description) stepErrors.description = 'Description is required';
        if (!formData.category) stepErrors.category = 'Category is required';
      } else if (currentStep === 2) {
        if (!selectedFile && !formData.imageUrl) stepErrors.image = 'Product image is required';
      } else if (currentStep === 3) {
        if (!formData.variants.length) stepErrors.variants = 'At least one variant is required';
        formData.variants.forEach((variant, index) => {
          if (!variant.sku) stepErrors[`variant${index}sku`] = 'SKU is required';
          if (!variant.price) stepErrors[`variant${index}price`] = 'Price is required';
          if (!variant.stock) stepErrors[`variant${index}stock`] = 'Stock is required';
        });
      }
      
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        setIsLoading(false);
        return;
      }

      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
        setIsLoading(false);
        return;
      }

      // Upload image if there's a new file
      let imageUrl = formData.imageUrl;
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      // Final submission on step 3
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category, // Send category name
        imageUrl: imageUrl,
        shopId: selectedShop?.id, // Use selected shop ID from context
        variants: formData.variants.map(variant => ({
          size: variant.size || null,
          color: variant.color || null,
          sku: variant.sku,
          price: parseFloat(variant.price),
          stock: parseInt(variant.stock, 10)
        }))
      };

      const response = await fetch('/api/vendor/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      onProductAdded();
      onClose();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add New Product - Step {currentStep} of 3</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          
          <div className="flex justify-end space-x-4 mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : currentStep === 3 ? 'Submit' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}