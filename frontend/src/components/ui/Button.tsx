import React, { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.99]';

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow focus:ring-2 focus:ring-blue-600/30 font-semibold',
    secondary: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 focus:ring-2 focus:ring-blue-500/20',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm focus:ring-2 focus:ring-slate-200',
    ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-2 focus:ring-red-500/30',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
