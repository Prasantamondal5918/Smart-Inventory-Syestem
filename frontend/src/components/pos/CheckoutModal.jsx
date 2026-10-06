import React from 'react';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

const CheckoutModal = ({ isOpen, onClose, cart, totals, customer, paymentMethod, onConfirmCheckout, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Sales Transaction">
      <div className="space-y-4">
        <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex items-center space-x-3 text-emerald-400">
          <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm text-emerald-300">Ready to Process Checkout</h4>
            <p className="text-xs text-emerald-400/80">Stock will be automatically deducted and invoice generated.</p>
          </div>
        </div>

        {/* Customer & Payment details */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-800/50 p-3 rounded-xl border border-slate-700">
          <div>
            <span className="text-slate-400 block font-medium">Customer:</span>
            <span className="font-bold text-white">{customer.name || 'Walk-in Customer'}</span>
            {customer.phone && <span className="block text-slate-400">{customer.phone}</span>}
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Payment Method:</span>
            <span className="font-bold text-indigo-400 uppercase">{paymentMethod}</span>
          </div>
        </div>

        {/* Items list preview */}
        <div className="max-h-48 overflow-y-auto divide-y divide-slate-800 bg-slate-950/50 p-3 rounded-xl border border-slate-800 text-xs">
          {cart.map(({ product, quantity }) => (
            <div key={product._id} className="py-1.5 flex justify-between items-center">
              <span className="text-slate-300 font-medium">
                {product.productName} <span className="text-slate-500">x{quantity}</span>
              </span>
              <span className="text-slate-200 font-bold">
                {formatCurrency(product.sellingPrice * quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Grand total summary */}
        <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center text-sm">
          <span className="font-bold text-slate-300">Total Payable Amount</span>
          <span className="text-xl font-extrabold text-emerald-400">{formatCurrency(totals.total)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl border border-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmCheckout}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{loading ? 'Processing...' : 'Confirm Checkout'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CheckoutModal;
