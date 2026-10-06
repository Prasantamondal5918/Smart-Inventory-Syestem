import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import InvoiceView from '../components/invoice/InvoiceView';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import { ArrowLeft } from 'lucide-react';

const InvoicePage = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoice = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/sales/${id}`);
      setSale(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  if (loading) return <LoadingSpinner label="Fetching invoice document..." />;
  if (error) return <ErrorState title="Invoice Error" message={error} onRetry={fetchInvoice} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <Link
          to="/sales"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sales History
        </Link>
      </div>

      <InvoiceView sale={sale} onPrint={() => window.print()} />
    </div>
  );
};

export default InvoicePage;
