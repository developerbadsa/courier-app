import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightAction,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[13px] font-medium text-[#334155] mb-1.5"
          >
            {label}
          </label>
        )}

        <div
          className={`relative flex items-center bg-[#F0F5FF] border rounded-[12px] px-3.5 py-2.5 transition-all duration-200 focus-within:bg-white focus-within:ring-2 ${
            error
              ? 'border-[#EF4444] focus-within:border-[#EF4444] focus-within:ring-[#EF4444]/20'
              : 'border-[#E0EAFF] focus-within:border-[#2563EB] focus-within:ring-[#2563EB]/20'
          }`}
        >
          {leftIcon && (
            <span className="text-slate-400 shrink-0 mr-2.5 flex items-center">
              {leftIcon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-transparent text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none ${className}`}
            {...props}
          />

          {rightAction && (
            <div className="shrink-0 ml-2 flex items-center">
              {rightAction}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-[#EF4444] mt-1.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#64748B] mt-1.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
