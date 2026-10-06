import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import { Package, Plus, Search, Filter, Eye, Edit3, Trash2, Image as ImageIcon } from 'lucide-react';

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.role === 'owner';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search }),
        ...(category && { category }),
        ...(brand && { brand }),
        ...(stockStatus && { stockStatus }),
      });

      const res = await API.get(`/products?${queryParams.toString()}`);
      setProducts(res.data.products);
      setTotalPages(res.data.pagination.pages);
      setTotalItems(res.data.pagination.total);
      setCategories(res.data.meta.categories || []);
      setBrands(res.data.meta.brands || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch products catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, category, brand, stockStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name}'?`)) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success(`Product '${name}' deleted successfully`);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage item specifications, pricing, and minimum threshold stock</p>
        </div>

        {isOwner && (
          <Link
            to="/products/add"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Brand Dropdown */}
          <select
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={stockStatus}
            onChange={(e) => {
              setStockStatus(e.target.value);
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Stock Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </form>
      </div>

      {/* Product List Table */}
      {loading ? (
        <LoadingSpinner label="Fetching products..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProducts} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No Products Found"
          description="Try clearing your filters or add your first product."
          action={
            isOwner && (
              <Link
                to="/products/add"
                className="mt-3 inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Link>
            )
          }
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Category & Brand</th>
                  <th className="py-3.5 px-4 text-right">Purchase Price</th>
                  <th className="py-3.5 px-4 text-right">Selling Price</th>
                  <th className="py-3.5 px-4 text-center">Current Stock</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map((p) => {
                  const isOutOfStock = p.stock === 0;
                  const isLowStock = p.stock <= p.minimumStock && p.stock > 0;

                  return (
                    <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 flex-shrink-0">
                            {p.image ? (
                              <img
                                src={p.image.startsWith('http') ? p.image : `${(import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '')}${p.image}`}
                                alt={p.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <Link to={`/products/${p._id}`} className="font-bold text-white hover:text-indigo-400">
                              {p.productName}
                            </Link>
                            {p.barcode && <p className="text-[10px] text-slate-400 font-mono">Barcode: {p.barcode}</p>}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-200">{p.category}</p>
                        <p className="text-[11px] text-slate-400">{p.brand}</p>
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-slate-400">{formatCurrency(p.purchasePrice)}</td>

                      <td className="py-3 px-4 text-right font-bold text-emerald-400">{formatCurrency(p.sellingPrice)}</td>

                      <td className="py-3 px-4 text-center font-bold text-slate-200">
                        {p.stock} <span className="text-[11px] font-normal text-slate-400">{p.unit}</span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isOutOfStock ? (
                          <Badge variant="danger">Out of Stock</Badge>
                        ) : isLowStock ? (
                          <Badge variant="warning">Low Stock</Badge>
                        ) : (
                          <Badge variant="success">In Stock</Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            to={`/products/${p._id}`}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="View Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {isOwner && (
                            <>
                              <Link
                                to={`/products/edit/${p._id}`}
                                className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                                title="Edit Product"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteProduct(p._id, p.productName)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={page} totalPages={totalPages} totalItems={totalItems} onPageChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );
};

export default Products;
