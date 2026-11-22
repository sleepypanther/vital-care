import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`border border-slate-200 rounded-xl bg-white p-4 ${className}`}>{children}</div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }> = ({ variant = 'primary', className = '', ...props }) => {
  const base = 'px-4 py-2 text-sm font-medium rounded-xl transition';
  const styles = variant === 'primary' ? 'bg-sky-600 text-white hover:bg-sky-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200';
  return <button className={`${base} ${styles} ${className}`} {...props} />;
};

export const Text: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`text-slate-900 ${className}`}>{children}</span>
);
