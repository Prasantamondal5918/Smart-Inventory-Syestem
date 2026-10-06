import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Users, ArrowLeft, Save, User, Mail, Phone, Lock, Calendar, Briefcase } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const WorkerAddEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      designation: 'Sales Representative',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'active',
    },
  });

  useEffect(() => {
    if (isEdit) {
      const fetchWorker = async () => {
        try {
          const res = await API.get(`/workers/${id}`);
          const w = res.data;
          setValue('name', w.name);
          setValue('email', w.email);
          setValue('phone', w.phone || '');
          setValue('designation', w.designation || 'Sales Representative');
          setValue('status', w.status || 'active');
          if (w.joiningDate) {
            setValue('joiningDate', new Date(w.joiningDate).toISOString().split('T')[0]);
          }
        } catch (err) {
          toast.error(err.message || 'Failed to fetch worker details');
          navigate('/workers');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchWorker();
    }
  }, [id, isEdit, setValue, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await API.put(`/workers/${id}`, data);
        toast.success('Worker details updated successfully!');
      } else {
        await API.post('/workers', data);
        toast.success('Worker registered successfully!');
      }
      navigate('/workers');
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <LoadingSpinner label="Fetching worker profile..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/workers"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Staff Directory
        </Link>
        <h1 className="text-xl font-bold text-white">{isEdit ? 'Update Worker Account' : 'Register New Worker'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Worker Name *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="John Doe"
                {...register('name', { required: 'Name is required' })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="staff@yourshop.com"
                disabled={isEdit}
                {...register('email', { required: 'Email is required' })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="+1 555-0211"
                {...register('phone', { required: 'Phone is required' })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            {errors.phone && <p className="text-[11px] text-rose-400 mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Designation *</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cashier, Inventory Manager..."
                {...register('designation', { required: 'Designation is required' })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            {errors.designation && <p className="text-[11px] text-rose-400 mt-1">{errors.designation.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Joining Date</label>
            <input
              type="date"
              {...register('joiningDate')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isEdit ? 'Reset Password (Leave blank to keep current)' : 'Password *'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder={isEdit ? 'New password...' : 'At least 6 characters'}
                {...register('password', {
                  required: !isEdit ? 'Password is required' : false,
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            {errors.password && <p className="text-[11px] text-rose-400 mt-1">{errors.password.message}</p>}
          </div>
        </div>

        {isEdit && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Account Status</label>
            <select
              {...register('status')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive (Deactivated)</option>
            </select>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
          <Link
            to="/workers"
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
            <span>{loading ? 'Saving...' : isEdit ? 'Update Worker' : 'Register Worker'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkerAddEdit;
