import React, { useState } from 'react';
import { Search, Plus, AlertCircle, Barcode, Image as ImageIcon } from 'lucide-react';
import Badge from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';

const ProductGrid = ({ products, onAddToCart, categories, onScanBarcodeClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm)) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search product name, category or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          onClick={onScanBarcodeClick}
          className="inline-flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-400 font-medium text-sm rounded-xl transition-colors space-x-2"
        >
          <Barcode className="w-4 h-4" />
          <span className="hidden sm:inline">Barcode</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedCategory === 'All'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 pr-1">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <AlertCircle className="w-10 h-10 text-slate-500 mb-2" />
            <p className="text-sm font-medium">No matching products found</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isOutOfStock = product.stock === 0;
            const isLowStock = product.stock <= product.minimumStock && product.stock > 0;

            return (
              <div
                key={product._id}
                onClick={() => !isOutOfStock && onAddToCart(product)}
                className={`flex flex-col justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/50 transition-all duration-200 group ${
                  isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5 shadow-md'
                }`}
              >
                <div>
                  <div className="relative w-full h-28 rounded-xl bg-slate-900 overflow-hidden mb-2.5 flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image.startsWith('http') ? product.image : `http://localhost:8000${product.image}`}
                        alt={product.productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}

                    {!product.image && <ImageIcon className="w-8 h-8 text-slate-600" />}

                    <div className="absolute top-2 right-2">
                      {isOutOfStock ? (
                        <Badge variant="danger">Out of Stock</Badge>
                      ) : isLowStock ? (
                        <Badge variant="warning">{product.stock} left</Badge>
                      ) : (
                        <Badge variant="success">{product.stock} {product.unit}</Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-400 truncate">{product.category}</p>
                  <h4 className="text-sm font-bold text-white line-clamp-1 mt-0.5">{product.productName}</h4>
                  {product.barcode && <p className="text-[10px] text-slate-500 font-mono mt-0.5">#{product.barcode}</p>}
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-700/40">
                  <span className="text-sm font-bold text-emerald-400">{formatCurrency(product.sellingPrice)}</span>
                  <button
                    disabled={isOutOfStock}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
