import React from 'react';

export function Input({
  label,
  id,
  type = 'text',
  error,
  helperText,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full px-3 py-2 bg-white border ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-[#1565C0]'
        } rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:border-[#1565C0] transition ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}

export function Select({
  label,
  id,
  options = [],
  error,
  className = '',
  children,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full px-3 py-2 bg-white border ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-[#1565C0]'
        } rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:border-[#1565C0] transition ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

export default Input;
