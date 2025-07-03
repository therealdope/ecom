import { useState, useEffect, useRef} from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useShop } from '@/context/ShopContext';
import { useToast } from '@/context/ToastContext';
import { TagIcon, DocumentTextIcon, Squares2X2Icon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function AddProductForm({ isOpen, onClose, onProductAdded }) {
  const { data: session } = useSession();
  const { showToast } = useToast();
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
  const [isSearching, setIsSearching] = useState(false);
  const [sizeUnit, setSizeUnit] = useState('cm');
  const [customSizeUnit, setCustomSizeUnit] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [colorPickerIndex, setColorPickerIndex] = useState("#");
  const colorInputRefs = useRef({});
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
  
  const getFilteredCategories = () => {
    if (!categorySearch) return [];
    return categories.filter(category =>
      category.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  };

  // New state to track selected category

// Modify this when selecting a category or creating one
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

const handleRemoveCategory = () => {
  setSelectedCategory(null);
  setFormData({ ...formData, category: '' });
  setCategorySearch('');
};


  // Add this function to handle category search input changes
  const handleCategorySearch = (value) => {
    setCategorySearch(value);
    setFormData({ ...formData, category: '' });
  };
  

  // Update the category selection JSX
const renderCategorySelection = () => {

  return (
    <div className="space-y-2 relative">
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
          className={`w-full pl-10 pr-10 py-3 rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
          ${errors.category?"border-red-500":""}`}
        />
        <Squares2X2Icon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}
      </div>

      {!formData.category && getFilteredCategories().length > 0 && (
        <ul className="absolute z-10 w-full mt-1 max-h-48 overflow-auto bg-white border border-indigo-300 rounded-md shadow-lg">
          {getFilteredCategories().map((category) => (
            <li
              key={category.id}
              onClick={() => {
                setFormData({ ...formData, category: category.name });
                setCategorySearch(category.name);
              }}
              className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition"
            >
              {category.name}
            </li>
          ))}
        </ul>
      )}

      {!formData.category &&
        categorySearch &&
        getFilteredCategories().length === 0 && (
          <button
            type="button"
            onClick={handleCreateCategory}
            className="mt-2 w-full py-2 px-4 text-sm text-indigo-600 hover:bg-indigo-100 rounded-md border border-indigo-300 bg-white transition"
          >
            Create new category &quot;{categorySearch}&quot;
          </button>
        )}
    </div>
  );
};

const renderStep1 = () => {
  return (
    <div className="space-y-6 p-4">
      {/* Product Name */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Name <span className="text-red-500">*</span>
          <span className="ml-1 text-xs text-gray-500">(Required)</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter product name"
            className={`pl-10 pr-4 py-3 w-full rounded-lg border text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <TagIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Description */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Enter product description"
            className={`pl-10 pr-4 py-3 w-full rounded-lg border text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <DocumentTextIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        {renderCategorySelection()}
      </div>
    </div>
  );
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

  // Update the renderStep3 function
  const renderStep3 = () => (
  <div className="space-y-6 p-4">
    {/* Header */}
    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-3">
      <h3 className="text-xl font-semibold text-indigo-800">
        Product Variants <span className="text-red-500">*</span>
      </h3>

      <button
        type="button"
        onClick={() =>
          setFormData((prev) => ({
            ...prev,
            variants: [...prev.variants, { size: '', color: '', sku: '', price: '', stock: '' }],
          }))
        }
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Add Variant
      </button>
    </div>

    {formData.variants.map((variant, index) => (
      <div
        key={index}
        className="rounded-2xl p-6 bg-indigo-100/20 border border-indigo-200/50 shadow backdrop-blur-md space-y-6 transition"
      >
        <div className="flex justify-between items-center border-b border-indigo-200/50 pb-3">
          <h4 className="text-lg font-medium text-indigo-900">Variant {index + 1}</h4>
          {formData.variants.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveVariant(index)}
              className="text-gray-400 hover:text-red-500 transition p-1 rounded-full hover:bg-red-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Size */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-indigo-900">
              Size <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Size"
                value={variant.size.split(/[a-zA-Z]+/)[0] || ''}
                onChange={(e) => {
                  const newSize = e.target.value + (sizeUnit === 'custom' ? customSizeUnit : sizeUnit);
                  handleVariantChange(index, 'size', newSize);
                }}
                className={`flex-1 rounded-xl px-4 py-2 bg-indigo-50 shadow-sm focus:ring-2 focus:ring-indigo-300 ${
                  errors[index]?.size ? 'border border-red-400' : ''
                }`}
              />
              <select
                value={sizeUnit}
                onChange={(e) => setSizeUnit(e.target.value)}
                className="rounded-xl px-4 py-2 bg-indigo-50 shadow-sm focus:ring-2 focus:ring-indigo-300"
              >
                {['cm', 'in', 'L', 'ml', 'kg', 'gm', 'custom'].map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            {sizeUnit === 'custom' && (
              <input
                type="text"
                placeholder="Custom unit"
                value={customSizeUnit}
                onChange={(e) => setCustomSizeUnit(e.target.value)}
                className="w-full rounded-xl px-4 py-2 bg-indigo-50 shadow-sm focus:ring-2 focus:ring-indigo-300"
              />
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-indigo-900">
              Color <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="#RRGGBB"
                value={variant.color}
                onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                className={`flex-1 rounded-xl px-4 py-2 bg-indigo-50 shadow-sm focus:ring-2 focus:ring-indigo-300 ${
                  !/^#([0-9A-F]{3}){1,2}$/i.test(variant.color) && variant.color ? 'border border-red-400' : ''
                }`}
              />
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
                  style={{
                    backgroundColor: /^#([0-9A-F]{3}){1,2}$/i.test(variant.color)
                      ? variant.color
                      : '#ffffff',
                  }}
                  onClick={() => setColorPickerIndex(index)}
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
            {!/^#([0-9A-F]{3}){1,2}$/i.test(variant.color) && variant.color && (
              <p className="text-xs text-red-500">Invalid hex code</p>
            )}
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-indigo-900">
              SKU <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Stock Keeping Unit"
              value={variant.sku}
              onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
              className={`w-full rounded-xl px-4 py-2 bg-indigo-50 shadow-sm focus:ring-2 focus:ring-indigo-300 ${
                errors[index]?.sku ? 'border border-red-400' : ''
              }`}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-indigo-900">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
              <input
                type="number"
                placeholder="0.00"
                value={variant.price}
                onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                className={`w-full rounded-xl pl-8 pr-4 py-2 bg-indigo-50 shadow-sm focus:ring-2 focus:ring-indigo-300 ${
                  errors?.price ? 'border border-red-400' : ''
                }`}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Stock */}
          <div className="space-y-2 sm:col-span-2">
            <label className="block text-sm font-semibold text-indigo-900">
              Stock <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Quantity in stock"
              value={variant.stock}
              onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
              className={`w-full rounded-xl px-4 py-2 bg-indigo-50 shadow-sm focus:ring-2 focus:ring-indigo-300 ${
                errors[index]?.stock ? 'border border-red-400' : ''
              }`}
              min="0"
            />
          </div>
        </div>
      </div>
    ))}
  </div>
);




// Image change handler
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  }
};
// Step 2 UI
const renderStep2 = () => (
  <div className="p-3">
    <label className="block text-sm font-semibold text-gray-800 mb-2">
      Product Image <span className="text-red-500">*</span>
    </label>

    <div className="flex justify-center items-center border-2 border-gray-400 border-dashed rounded-xl bg-gray-50 hover:border-indigo-600 transition-colors min-h-[300px]">
      <div className="w-full text-center p-3">
        {previewImage ? (
          <div className="relative group mx-auto w-full max-w-md aspect-square rounded-xl overflow-hidden">
            <Image
              src={previewImage}
              alt="Product preview"
              layout="fill"
              objectFit="cover"
              className="rounded-xl"
            />
            {/* Overlay and remove icon on hover */}
            <div className="absolute inset-0 bg-black/80 bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setPreviewImage(null);
                  setSelectedFile(null);
                }}
                className="text-white p-3 rounded-full hover:text-red-500 transition"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <svg className="h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>

            <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-1.5 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition">
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>

            <p className="text-sm text-gray-500">or drag and drop</p>
            <p className="text-xs text-gray-400">PNG, JPG, GIF — up to 10MB</p>
          </div>
        )}
      </div>
    </div>

    {errors.image && (
      <p className="mt-2 text-sm text-red-600">{errors.image}</p>
    )}
  </div>
);

  // Add handleSubmit function before the return statement
  const uploadImage = async (selectedFile) => {
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', 'products'); // Specify the products folder

      const response = await fetch('/api/cloudinary/upload', {
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
      
      const data = await response.json();
      if (!response.ok) {
        showToast({
          title: 'Error',
          description: data.error
        });
      }
      if(response.ok){
        showToast({
        title: 'Product Added',
        description: 'Product has been added successfully'
      });
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
    <div className="fixed z-50 inset-0 bg-black/30 backdrop-blur-sm overflow-y-auto h-full w-full">
      <div className="relative sm:top-20 mx-auto p-5 w-full sm:max-w-4xl shadow-xl md:rounded-2xl bg-white min-h-screen sm:min-h-0">
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
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          
          <div className="flex justify-end space-x-4 sticky bottom-0 bg-white p-4 ">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
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