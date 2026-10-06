import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Barcode, Search } from 'lucide-react';

const BarcodeScannerModal = ({ isOpen, onClose, onFindProductByBarcode }) => {
  const [barcodeInput, setBarcodeInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      onFindProductByBarcode(barcodeInput.trim());
      setBarcodeInput('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Barcode Quick Lookup">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
          <Barcode className="w-16 h-16 text-indigo-400 animate-pulse mb-3" />
          <p className="text-sm font-semibold text-slate-200">Scan Barcode with USB Scanner</p>
          <p className="text-xs text-slate-400 mt-1">Or manually type the barcode number below</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Barcode / SKU Number</label>
          <div className="relative">
            <input
              type="text"
              autoFocus
              placeholder="e.g. 8901001001"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BarcodeScannerModal;
