import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorState = ({ title = 'Failed to load data', message = 'Something went wrong while fetching data from server.', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-rose-950/20 rounded-xl border border-rose-800/40 text-center my-4">
      <div className="w-12 h-12 rounded-full bg-rose-900/40 flex items-center justify-center text-rose-400 mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-rose-200">{title}</h3>
      <p className="text-sm text-rose-300/80 max-w-md mt-1 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
