import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import Badge from '../components/common/Badge';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { ArrowLeft, Edit3, Boxes, ShoppingBag, Image as ImageIcon, Barcode, Calendar, User } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.role === 'owner';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/products/${id}`);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) return <LoadingSpinner label="Fetching product specifications..." />;
  if (error) return <ErrorState title="Product Not Found" message={error} onRetry={fetchDetail} />;

  const { product, totalSold, stockStatus } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/products"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products Catalog
        </Link>
        {isOwner && (
          <Link
            to={`/products/edit/${product._id}`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Product</span>
          </Link>
        )}
      </div>

      {/* Main Detail Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Image Box */}
          <div className="w-full h-64 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden p-2">
            {product.image ? (
              <img
                src={product.image.startsWith('http') ? product.image : `${(import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '')}${product.image}`}
                alt={product.productName}
                className="w-full h-full object-contain"
              />
            ) : (
              <ImageIcon className="w-16 h-16 text-slate-700" />
            )}
          </div>

          {/* Core Info */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <Badge variant={stockStatus === 'IN STOCK' ? 'success' : stockStatus === 'LOW STOCK' ? 'warning' : 'danger'}>
                  {stockStatus}
                </Badge>
                <span className="text-xs text-slate-400">{product.category}</span>
                <span className="text-xs text-slate-600">•</span>
                <span className="text-xs text-slate-400">{product.brand}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white mt-1">{product.productName}</h1>
              {product.barcode && (
                <div className="flex items-center space-x-1 text-xs font-mono text-indigo-400 mt-1">
                  <Barcode className="w-4 h-4" />
                  <span>#{product.barcode}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800">
              {product.description || 'No description specified for this product.'}
            </p>

            {/* Price Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Selling Price</span>
                <p className="text-base font-bold text-emerald-400 mt-0.5">{formatCurrency(product.sellingPrice)}</p>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Purchase Price</span>
                <p className="text-base font-bold text-slate-300 mt-0.5">{formatCurrency(product.purchasePrice)}</p>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Stock</span>
                <p className="text-base font-bold text-white mt-0.5">
                  {product.stock} <span className="text-xs font-normal text-slate-400">{product.unit}</span>
                </p>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Sold</span>
                <p className="text-base font-bold text-indigo-400 mt-0.5">{totalSold} units</p>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Meta Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Created By: <strong className="text-slate-200">{product.createdBy?.name || 'System Admin'}</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Last Updated: <strong className="text-slate-200">{formatDateTime(product.updatedAt)}</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <Boxes className="w-4 h-4 text-amber-400" />
            <span>Minimum Threshold Limit: <strong className="text-slate-200">{product.minimumStock} {product.unit}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
