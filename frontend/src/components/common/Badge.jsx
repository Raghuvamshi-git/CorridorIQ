import React from 'react';

export default function Badge({ children, variant = 'default', size = 'sm' }) {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
    warning: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
    danger: 'bg-rose-950/80 text-rose-400 border-rose-800/60',
    info: 'bg-indigo-950/80 text-indigo-400 border-indigo-800/60',
    cyan: 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60',
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-sm font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.sm}`}
    >
      {children}
    </span>
  );
}

