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
            className="block text-[13px] font-semibold text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}

        <div
          className={`relative flex items-center bg-white border rounded-lg px-3.5 py-2.5 shadow-sm transition-all duration-150 ${
            error
              ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20'
              : 'border-slate-200 hover:border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/15'
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
            className={`w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none ${className}`}
            {...props}
          />

          {rightAction && (
            <div className="shrink-0 ml-2 flex items-center">
              {rightAction}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 mt-1.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
