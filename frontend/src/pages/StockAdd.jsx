import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Boxes, ArrowLeft, Save, Truck, Calendar, FileText, Package } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const StockAdd = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      productId: '',
      quantity: '',
      supplier: 'General Supplier',
      purchaseDate: new Date().toISOString().split('T')[0],
      invoiceNumber: '',
      expiryDate: '',
      batchNumber: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, suppRes] = await Promise.all([
          API.get('/products?limit=100'),
          API.get('/suppliers?limit=100'),
        ]);
        setProducts(prodRes.data.products || []);
        setSuppliers(suppRes.data.suppliers || []);
      } catch (err) {
        toast.error('Failed to load products and suppliers list');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await API.post('/stock', data);
      toast.success('Stock added successfully and inventory updated!');
      navigate('/stock');
    } catch (err) {
      toast.error(err.message || 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <LoadingSpinner label="Loading product & supplier registries..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <Link
          to="/stock"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Inventory Logs
        </Link>
        <h1 className="text-xl font-bold text-white">Add Stock / Restock Inventory</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Product Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Select Registered Product *</label>
          <div className="relative">
            <Package className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              {...register('productId', { required: 'Please select a product' })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Select Product --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.productName} (Current Stock: {p.stock} {p.unit})
                </option>
              ))}
            </select>
          </div>
          {errors.productId && <p className="text-[11px] text-rose-400 mt-1">{errors.productId.message}</p>}
        </div>

        {/* Quantity & Supplier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity to Add *</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 50"
              {...register('quantity', {
                required: 'Quantity is required',
                min: { value: 1, message: 'Quantity must be at least 1' },
              })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
            />
            {errors.quantity && <p className="text-[11px] text-rose-400 mt-1">{errors.quantity.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Supplier Name</label>
            <div className="relative">
              <Truck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                list="supplier-options"
                placeholder="Global Foods Ltd"
                {...register('supplier')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <datalist id="supplier-options">
                {suppliers.map((s) => (
                  <option key={s._id} value={s.name} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {/* Purchase Date & Invoice No */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Purchase Date</label>
            <input
              type="date"
              {...register('purchaseDate')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Supplier Invoice Number</label>
            <input
              type="text"
              placeholder="SUP-INV-9901"
              {...register('invoiceNumber')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Expiry Date & Batch Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry Date (Optional)</label>
            <input
              type="date"
              {...register('expiryDate')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Batch Number</label>
            <input
              type="text"
              placeholder="BATCH-2026-A"
              {...register('batchNumber')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
          <Link
            to="/stock"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Adding Stock...' : 'Confirm & Add Stock'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockAdd;
