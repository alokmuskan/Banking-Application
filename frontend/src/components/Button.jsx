import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:   'bg-primary-600 hover:bg-primary-700 text-white border border-transparent',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-transparent',
  outlined:  'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200',
  danger:    'bg-red-600 hover:bg-red-700 text-white border border-transparent',
  ghost:     'bg-transparent hover:bg-slate-50 text-slate-600 border border-transparent',
  success:   'bg-accent-600 hover:bg-accent-700 text-white border border-transparent',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-6 text-sm',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-all duration-150 active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-1
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {!loading && Icon && iconPosition === 'left' && <Icon size={14} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={14} />}
    </button>
  );
};

export default Button;
