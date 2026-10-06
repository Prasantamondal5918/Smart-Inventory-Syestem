import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import { formatCurrency } from '../utils/formatters';
import { Search, Package, Users, Receipt, UserCheck } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResults = async () => {
    if (!query) {
      setResults({ products: [], workers: [], invoices: [], customers: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/search?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) {
      setError(err.message || 'Global search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [query]);

  if (loading) return <LoadingSpinner label={`Searching for '${query}'...`} />;
  if (error) return <ErrorState message={error} onRetry={fetchResults} />;

  const { products = [], workers = [], invoices = [], customers = [] } = results || {};
  const totalMatches = products.length + workers.length + invoices.length + customers.length;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <h1 className="text-2xl font-bold text-white">Search Results</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Found <strong className="text-indigo-400">{totalMatches}</strong> matching records for query: "<span className="text-white font-mono">{query}</span>"
        </p>
      </div>

      {totalMatches === 0 ? (
        <EmptyState title="No Matching Results Found" description="Try searching with a different product name, barcode, worker ID, or invoice number." />
      ) : (
        <div className="space-y-6">
          {/* Products Results */}
          {products.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                <Package className="w-5 h-5" />
                <h3>Matched Products ({products.length})</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {products.map((p) => (
                  <Link
                    key={p._id}
                    to={`/products/${p._id}`}
                    className="p-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/60 transition-colors flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-white truncate">{p.productName}</h4>
                      <p className="text-[10px] text-slate-400">{p.category} • Barcode: {p.barcode || 'N/A'}</p>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-400">{formatCurrency(p.sellingPrice)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Invoices Results */}
          {invoices.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <Receipt className="w-5 h-5" />
                <h3>Matched Invoices ({invoices.length})</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {invoices.map((inv) => (
                  <Link
                    key={inv._id}
                    to={`/sales/${inv._id}`}
                    className="p-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/60 transition-colors flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-indigo-300 font-mono">{inv.invoiceNo}</h4>
                      <p className="text-[10px] text-slate-400">Customer: {inv.customer?.name || 'Walk-in'}</p>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-400">{formatCurrency(inv.total)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Workers Results */}
          {workers.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
                <Users className="w-5 h-5" />
                <h3>Matched Staff Workers ({workers.length})</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {workers.map((w) => (
                  <div key={w._id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                    <h4 className="font-bold text-xs text-white">{w.name}</h4>
                    <p className="text-[10px] text-indigo-400 font-mono">ID: {w.workerId}</p>
                    <p className="text-[10px] text-slate-400">{w.designation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
