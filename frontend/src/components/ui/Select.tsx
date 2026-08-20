import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  containerClassName?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  selectSize?: 'sm' | 'md' | 'lg';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      placeholder,
      className = '',
      containerClassName = '',
      wrapperClassName = '',
      labelClassName = '',
      selectSize = 'md',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const sizeStyles = {
      sm: 'h-8 text-xs',
      md: 'h-10 text-xs sm:text-[13px]',
      lg: 'h-12 text-sm',
    };

    return (
      <div className={`w-full ${containerClassName} font-sans`}>
        {label && (
          <label
            htmlFor={selectId}
            className={`block text-xs font-semibold text-slate-700 mb-1.5 ${labelClassName}`}
          >
            {label}
          </label>
        )}

        <div
          className={`relative flex items-center ${sizeStyles[selectSize]} bg-slate-50 border rounded transition-all duration-150 ${
            error
              ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 bg-white'
              : 'border-slate-200 hover:border-slate-300 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/10'
          } ${wrapperClassName}`}
        >
          <select
            id={selectId}
            ref={ref}
            className={`w-full h-full appearance-none bg-transparent text-xs sm:text-[13px] text-slate-800 px-3 pr-8 focus:outline-none font-normal cursor-pointer ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-xs sm:text-[13px] text-slate-800">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2]" />
        </div>

        {error ? (
          <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
