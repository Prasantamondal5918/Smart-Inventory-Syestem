import React from 'react';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, Banknote, Smartphone, HelpCircle, UserCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const Cart = ({
  cart,
  onUpdateQuantity,
  onRemoveFromCart,
  onClearCart,
  totals,
  discount,
  onDiscountChange,
  paymentMethod,
  onPaymentMethodChange,
  customer,
  onCustomerChange,
  onProceedToCheckout,
  loading,
}) => {
  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'upi', label: 'UPI', icon: Smartphone },
    { id: 'other', label: 'Other', icon: HelpCircle },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">Current Cart</h3>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full">
            {totals.itemCount} items
          </span>
        </div>
        {cart.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Cart Items Scrollable List */}
      <div className="flex-1 overflow-y-auto my-3 space-y-2.5 pr-1">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
            <ShoppingBag className="w-12 h-12 stroke-1 mb-2" />
            <p className="text-sm font-medium">Cart is currently empty</p>
            <p className="text-xs text-slate-600">Select products from left grid to add</p>
          </div>
        ) : (
          cart.map(({ product, quantity }) => {
            const itemSubtotal = product.sellingPrice * quantity;
            return (
              <div
                key={product._id}
                className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h5 className="text-xs font-semibold text-white truncate">{product.productName}</h5>
                  <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                    {formatCurrency(product.sellingPrice)} / {product.unit}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                  <button
                    onClick={() => onUpdateQuantity(product._id, -1)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-white px-1">{quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(product._id, 1)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Line Total & Remove */}
                <div className="flex items-center space-x-2 pl-3">
                  <span className="text-xs font-bold text-white">{formatCurrency(itemSubtotal)}</span>
                  <button
                    onClick={() => onRemoveFromCart(product._id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Customer Information */}
      <div className="pt-3 border-t border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-1">
          <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Customer Information</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Customer Name"
            value={customer.name}
            onChange={(e) => onCustomerChange({ name: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={customer.phone}
            onChange={(e) => onCustomerChange({ phone: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="mt-3">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
          Payment Method
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {paymentMethods.map((pm) => {
            const Icon = pm.icon;
            const isSelected = paymentMethod === pm.id;
            return (
              <button
                key={pm.id}
                type="button"
                onClick={() => onPaymentMethodChange(pm.id)}
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-[10px] font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{pm.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mt-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-200">{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Tax Amount</span>
          <span className="font-semibold text-slate-200">{formatCurrency(totals.tax)}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Discount ($)</span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={discount}
            onChange={(e) => onDiscountChange(e.target.value)}
            className="w-20 text-right bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-sm font-bold text-white">
          <span>Grand Total</span>
          <span className="text-lg text-emerald-400">{formatCurrency(totals.total)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onProceedToCheckout}
        disabled={cart.length === 0 || loading}
        className="mt-3 w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {loading ? 'Processing Checkout...' : `Complete Sale (${formatCurrency(totals.total)})`}
      </button>
    </div>
  );
};

export default Cart;
