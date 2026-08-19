import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string | React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', id, ...props }, ref) => {
    const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label
        htmlFor={checkboxId}
        className="inline-flex items-center gap-2 cursor-pointer select-none group"
      >
        <input
          id={checkboxId}
          ref={ref}
          type="checkbox"
          className={`w-4 h-4 rounded-[4px] border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB] focus:ring-offset-0 bg-[#F0F5FF] cursor-pointer transition-colors ${className}`}
          {...props}
        />
        {label && (
          <span className="text-[13px] text-[#475569] group-hover:text-[#334155] font-normal transition-colors">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
