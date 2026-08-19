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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-[12px] transition-all duration-200 focus:outline-none active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 select-none';

  const sizeStyles = {
    sm: 'h-9 px-3.5 text-xs gap-1.5',
    md: 'h-[44px] px-4 text-[14px] gap-2',
    lg: 'h-12 px-6 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#2563EB] hover:bg-[#1E40AF] text-white shadow-sm hover:shadow focus:ring-2 focus:ring-[#2563EB]/30',
    secondary: 'bg-[#DBEAFE] hover:bg-[#BFDBFE] text-[#1E40AF] focus:ring-2 focus:ring-[#2563EB]/20',
    outline: 'border border-[#E2E8F0] hover:bg-slate-50 text-[#334155] focus:ring-2 focus:ring-slate-200',
    ghost: 'hover:bg-slate-100 text-[#334155]',
    danger: 'bg-[#EF4444] hover:bg-red-600 text-white shadow-sm focus:ring-2 focus:ring-[#EF4444]/30',
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
