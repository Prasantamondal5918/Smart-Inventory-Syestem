import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { GitBranch, Plus, Edit3, MapPin, UserCheck, Building } from 'lucide-react';
import { useForm } from 'react-hook-form';

const Branches = () => {
  const { user } = useAuthStore();
  const isOwner = user?.role === 'owner';

  const [branches, setBranches] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const [branchRes, workerRes] = await Promise.all([
        API.get('/branches'),
        API.get('/workers?limit=100'),
      ]);
      setBranches(branchRes.data);
      setWorkers(workerRes.data.workers || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch shop branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBranch(null);
    reset({ branchName: '', address: '', manager: '', status: 'active' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (branch) => {
    setEditingBranch(branch);
    setValue('branchName', branch.branchName);
    setValue('address', branch.address || '');
    setValue('manager', branch.manager?._id || '');
    setValue('status', branch.status || 'active');
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingBranch) {
        await API.put(`/branches/${editingBranch._id}`, data);
        toast.success('Branch details updated');
      } else {
        await API.post('/branches', data);
        toast.success('Branch added successfully');
      }
      setIsModalOpen(false);
      fetchBranches();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Multi-Branch Locations</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage store outlets, assigned branch managers and regional inventories</p>
        </div>

        {isOwner && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Branch Outlet</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="Retrieving shop branches..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBranches} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((b) => (
            <div key={b._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      <GitBranch className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{b.branchName}</h3>
                      <p className="text-[10px] text-indigo-400 font-mono font-semibold">{b.branchId}</p>
                    </div>
                  </div>

                  <Badge variant={b.status === 'active' ? 'success' : 'danger'}>
                    {b.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Manager: <strong className="text-white">{b.manager?.name || 'Owner Managed'}</strong></span>
                  </div>
                  {b.address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
                      <span>{b.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {isOwner && (
                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleOpenEditModal(b)}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-400 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Branch</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBranch ? 'Edit Branch Location' : 'Add New Branch Outlet'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Branch Name *</label>
            <input
              type="text"
              placeholder="Apex Supermarket - Downtown Outlet"
              {...register('branchName', { required: true })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Branch Manager</label>
            <select
              {...register('manager')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Select Manager --</option>
              {workers.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.workerId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Outlet Address</label>
            <input
              type="text"
              placeholder="Branch street address..."
              {...register('address')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {editingBranch && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Save Branch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Branches;
