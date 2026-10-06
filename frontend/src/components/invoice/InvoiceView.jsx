import React from 'react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Store, Printer, Download, ShoppingBag, CheckCircle, Barcode } from 'lucide-react';

const InvoiceView = ({ sale, onPrint }) => {
  if (!sale) return null;

  const shop = sale.shopId || {};
  const cashier = sale.cashier || {};

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-w-3xl mx-auto">
      {/* Top Action Bar */}
      <div className="p-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between no-print">
        <div className="flex items-center space-x-2 text-emerald-400">
          <CheckCircle className="w-5 h-5" />
          <span className="font-bold text-sm">Official Invoice Generated</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onPrint}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Printable Container Body */}
      <div id="printable-invoice" className="p-6 sm:p-8 bg-slate-900 text-slate-100 space-y-6">
        {/* Header Shop Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-800 pb-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">{shop.shopName || 'Apex Supermarket'}</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">{shop.address || 'Commercial Blvd, City'}</p>
              {shop.phone && <p className="text-xs text-slate-400">Phone: {shop.phone}</p>}
              {shop.gstNumber && <p className="text-xs text-indigo-400 font-mono mt-0.5">GSTIN: {shop.gstNumber}</p>}
            </div>
          </div>

          <div className="mt-4 sm:mt-0 text-left sm:text-right">
            <div className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-xs font-bold text-indigo-300 uppercase tracking-wide">
              INVOICE
            </div>
            <h3 className="text-sm font-bold text-white font-mono mt-2">{sale.invoiceNo}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(sale.createdAt)}</p>
          </div>
        </div>

        {/* Transaction Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Billed To (Customer):</span>
            <span className="font-bold text-white block mt-0.5">{sale.customer?.name || 'Walk-in Customer'}</span>
            {sale.customer?.phone && <span className="text-slate-400 block">{sale.customer.phone}</span>}
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Cashier / Staff:</span>
            <span className="font-bold text-white block mt-0.5">{cashier.name || 'Store Staff'}</span>
            {cashier.workerId && <span className="text-slate-400 block">ID: {cashier.workerId}</span>}
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Payment Method:</span>
            <span className="font-bold text-emerald-400 uppercase block mt-0.5">{sale.paymentMethod}</span>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3 text-right">Tax</th>
                <th className="py-2.5 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sale.products.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-semibold text-white">{item.productName}</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-300">{item.quantity}</td>
                  <td className="py-3 px-3 text-right text-slate-300">{formatCurrency(item.price)}</td>
                  <td className="py-3 px-3 text-right text-slate-400">{formatCurrency(item.tax)}</td>
                  <td className="py-3 px-3 text-right font-bold text-white">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t border-slate-800">
          <div className="space-y-2 text-center sm:text-left mb-4 sm:mb-0">
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono">
              <Barcode className="w-6 h-6" />
              <span>*{sale.invoiceNo}*</span>
            </div>
            <p className="text-xs text-slate-400 italic">Thank you for shopping with us!</p>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 text-xs bg-slate-800/50 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-200">{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Tax:</span>
              <span className="font-semibold text-slate-200">{formatCurrency(sale.tax)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Discount Applied:</span>
              <span className="font-semibold text-rose-400">-{formatCurrency(sale.discount)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-700">
              <span>Grand Total:</span>
              <span className="text-emerald-400 text-base">{formatCurrency(sale.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
