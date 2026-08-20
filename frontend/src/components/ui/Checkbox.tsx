import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | React.ReactNode;
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      checked,
      className = '',
      containerClassName = '',
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const checkboxId =
      id ||
      (typeof label === 'string'
        ? label.toLowerCase().replace(/\s+/g, '-')
        : undefined);

    return (
      <label
        htmlFor={checkboxId}
        className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${containerClassName}`}
      >
        <div className="relative flex items-center justify-center shrink-0">
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition-all duration-150 ${
              checked
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-slate-300 bg-white group-hover:border-slate-400 group-hover:bg-slate-50'
            } ${className}`}
          >
            {checked && <Check size={10} strokeWidth={3} className="text-white" />}
          </div>
        </div>
        {label && (
          <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
