import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { Truck, Plus, Search, Edit3, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';

const Suppliers = () => {
  const { user } = useAuthStore();
  const isOwner = user?.role === 'owner';

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/suppliers${search ? `?search=${search}` : ''}`);
      setSuppliers(res.data.suppliers);
    } catch (err) {
      setError(err.message || 'Failed to fetch suppliers directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    reset({ name: '', phone: '', email: '', address: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setValue('name', supplier.name);
    setValue('phone', supplier.phone || '');
    setValue('email', supplier.email || '');
    setValue('address', supplier.address || '');
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingSupplier) {
        await API.put(`/suppliers/${editingSupplier._id}`, data);
        toast.success('Supplier updated successfully');
      } else {
        await API.post('/suppliers', data);
        toast.success('Supplier created successfully');
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete supplier '${name}'?`)) return;
    try {
      await API.delete(`/suppliers/${id}`);
      toast.success(`Supplier '${name}' deleted`);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Suppliers & Distributors Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage wholesale contacts, addresses, and supply contacts</p>
        </div>

        {isOwner && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        )}
      </div>

      {/* Grid of Suppliers Cards */}
      {loading ? (
        <LoadingSpinner label="Fetching suppliers registry..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSuppliers} />
      ) : suppliers.length === 0 ? (
        <EmptyState title="No Suppliers Added" description="Click 'Add Supplier' to add your first vendor contact." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                      <Truck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-sm">{s.name}</h3>
                  </div>
                  {isOwner && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(s)}
                        className="p-1 text-slate-400 hover:text-indigo-400 rounded transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s._id, s.name)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-400">
                  {s.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{s.email}</span>
                    </div>
                  )}
                  {s.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{s.phone}</span>
                    </div>
                  )}
                  {s.address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
                      <span>{s.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier Details' : 'Add New Supplier'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Supplier Name *</label>
            <input
              type="text"
              placeholder="Global Foods Wholesale"
              {...register('name', { required: 'Supplier name is required' })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+1 800-555-1111"
                {...register('phone')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="sales@globalfoods.com"
                {...register('email')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Address</label>
            <textarea
              rows="2"
              placeholder="Supply warehouse address..."
              {...register('address')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Save Supplier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
