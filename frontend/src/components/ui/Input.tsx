import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  containerClassName?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  inputSize?: 'sm' | 'md' | 'lg';
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
      wrapperClassName = '',
      labelClassName = '',
      inputSize = 'md',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const sizeStyles = {
      sm: 'h-8 text-xs px-2.5',
      md: 'h-10 text-sm px-3',
      lg: 'h-12 text-sm sm:text-base px-3.5',
    };

    return (
      <div className={`w-full ${containerClassName} font-sans`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-xs font-semibold text-slate-700 mb-1.5 ${labelClassName}`}
          >
            {label}
          </label>
        )}

        <div
          className={`relative flex items-center ${sizeStyles[inputSize]} bg-slate-50 border rounded transition-all duration-150 ${
            error
              ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 bg-white'
              : 'border-slate-200 hover:border-slate-300 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/10'
          } ${wrapperClassName}`}
        >
          {leftIcon && (
            <span className="text-slate-400 shrink-0 mr-2.5 flex items-center justify-center">
              {leftIcon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`w-full min-w-0 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium ${className}`}
            {...props}
          />

          {rightAction && (
            <div className="shrink-0 ml-2 flex items-center justify-center text-slate-400">
              {rightAction}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 mt-1.5 font-medium">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
