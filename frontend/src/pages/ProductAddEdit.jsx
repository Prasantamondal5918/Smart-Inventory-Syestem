import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Package, ArrowLeft, Upload, Save, Image as ImageIcon } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductAddEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      productName: '',
      barcode: '',
      category: 'General',
      brand: 'Generic',
      purchasePrice: '',
      sellingPrice: '',
      taxPercentage: 0,
      unit: 'pcs',
      minimumStock: 5,
      initialStock: 0,
      description: '',
      image: '',
    },
  });

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const res = await API.get(`/products/${id}`);
          const p = res.data.product;
          setValue('productName', p.productName);
          setValue('barcode', p.barcode || '');
          setValue('category', p.category || 'General');
          setValue('brand', p.brand || 'Generic');
          setValue('purchasePrice', p.purchasePrice);
          setValue('sellingPrice', p.sellingPrice);
          setValue('taxPercentage', p.taxPercentage || 0);
          setValue('unit', p.unit || 'pcs');
          setValue('minimumStock', p.minimumStock || 5);
          setValue('stock', p.stock || 0);
          setValue('description', p.description || '');

          if (p.image) {
            setImagePreview(p.image.startsWith('http') ? p.image : `${(import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '')}${p.image}`);
          }
        } catch (err) {
          toast.error(err.message || 'Failed to fetch product details');
          navigate('/products');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, setValue, navigate]);

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // must match backend upload.middleware.js
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate before upload — the backend rejects these, and a rejected
    // image means the whole product is NOT created.
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG or WEBP images are allowed.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(`Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('productName', data.productName);
      formData.append('barcode', data.barcode || '');
      formData.append('category', data.category);
      formData.append('brand', data.brand);
      formData.append('purchasePrice', data.purchasePrice);
      formData.append('sellingPrice', data.sellingPrice);
      formData.append('taxPercentage', data.taxPercentage || 0);
      formData.append('unit', data.unit);
      formData.append('minimumStock', data.minimumStock);
      formData.append('description', data.description || '');

      if (!isEdit && data.initialStock) {
        formData.append('initialStock', data.initialStock);
      }

      if (isEdit && data.stock !== undefined) {
        formData.append('stock', data.stock);
      }

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      if (isEdit) {
        await API.put(`/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated successfully!');
      } else {
        await API.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created successfully!');
      }

      navigate('/products');
    } catch (err) {
      // Show the server's exact reason (bad image, missing price, ...) so a
      // failed submit never looks like the data silently vanished.
      toast.error(err.message || 'Operation failed');
      console.error('Product save failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <LoadingSpinner label="Loading product specifications..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <Link
          to="/products"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products
        </Link>
        <h1 className="text-xl font-bold text-white">{isEdit ? 'Edit Product Specifications' : 'Register New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Product Identification</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name *</label>
              <input
                type="text"
                placeholder="Organic Whole Milk 1L"
                {...register('productName', { required: 'Product name is required' })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              {errors.productName && <p className="text-[11px] text-rose-400 mt-1">{errors.productName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Barcode / SKU Number</label>
              <input
                type="text"
                placeholder="8901001001"
                {...register('barcode')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
              <input
                type="text"
                placeholder="Dairy, Electronics, Grocery..."
                {...register('category', { required: 'Category is required' })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              {errors.category && <p className="text-[11px] text-rose-400 mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Name</label>
              <input
                type="text"
                placeholder="Generic or Brand Name"
                {...register('brand')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Units */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Pricing & Threshold Stock</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Purchase Price ($) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('purchasePrice', { required: 'Purchase price is required', min: 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              {errors.purchasePrice && <p className="text-[11px] text-rose-400 mt-1">{errors.purchasePrice.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Selling Price ($) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('sellingPrice', { required: 'Selling price is required', min: 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              {errors.sellingPrice && <p className="text-[11px] text-rose-400 mt-1">{errors.sellingPrice.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tax Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                placeholder="5"
                {...register('taxPercentage')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit of Measurement</label>
              <input
                type="text"
                placeholder="pcs, kg, carton, bottle..."
                {...register('unit')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Stock Alert Limit</label>
              <input
                type="number"
                placeholder="5"
                {...register('minimumStock')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {!isEdit ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Opening Stock</label>
                <input
                  type="number"
                  placeholder="0"
                  {...register('initialStock')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Stock</label>
                <input
                  type="number"
                  {...register('stock')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Media & Description */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Product Image & Description</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Upload Product Image (Multer)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                />
              </div>

              <p className="text-[11px] text-slate-500 mt-1">Upload a clear product image for catalog display.</p>
            </div>

            {/* Preview Box */}
            <div className="flex flex-col items-center justify-center p-3 bg-slate-950 rounded-xl border border-slate-800 h-32">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full object-contain rounded-lg" />
              ) : (
                <div className="text-center text-slate-600">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                  <span className="text-[11px]">Image Preview</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Notes</label>
            <textarea
              rows="3"
              placeholder="Product details, batch information..."
              {...register('description')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
          <Link
            to="/products"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductAddEdit;
