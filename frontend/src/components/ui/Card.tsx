import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  withGlow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  withGlow = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`relative bg-white rounded-xl p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.04)] border border-slate-200/80 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
