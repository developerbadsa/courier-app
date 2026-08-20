import React, { TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      className = '',
      containerClassName = '',
      id,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full ${containerClassName} font-sans`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-[13px] font-semibold text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`w-full px-3 py-2.5 text-sm bg-slate-50 border rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 resize-none font-medium transition-all duration-150 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-white'
              : 'border-slate-200 hover:border-slate-300'
          } ${className}`}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
