import React from 'react';

const FormInput = React.forwardRef(({
  label,
  error,
  prefix,
  suffix,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-slate-400 text-sm pointer-events-none">{prefix}</span>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            h-10 w-full rounded-lg border text-sm text-slate-900 bg-white
            placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500
            transition duration-150
            ${error ? 'border-red-400 focus:ring-red-100 focus:border-red-500' : 'border-slate-200'}
            ${prefix ? 'pl-8' : 'pl-3'}
            ${suffix ? 'pr-8' : 'pr-3'}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-slate-400 text-sm pointer-events-none">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});

FormInput.displayName = 'FormInput';
export default FormInput;
