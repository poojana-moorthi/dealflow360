import React from 'react';

export function Table({ headers = [], children, className = '' }) {
  return (
    <div className={`overflow-x-auto w-full border border-slate-200 rounded-lg ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600">
            {headers.map((h, i) => (
              <th key={i} className="py-3 px-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
      </table>
    </div>
  );
}

export function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;
  const styles = {
    info: 'bg-blue-600 text-white',
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-amber-600 text-white'
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${styles[type] || styles.info}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-3 text-white/80 hover:text-white font-bold">
          ✕
        </button>
      )}
    </div>
  );
}

export default Table;
