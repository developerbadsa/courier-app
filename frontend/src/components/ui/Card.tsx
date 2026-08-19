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
      className={`relative bg-white rounded-[24px] p-8 sm:p-9 shadow-card-soft border border-slate-100/80 overflow-hidden ${className}`}
      {...props}
    >
      {withGlow && (
        <div
          className="absolute top-0 right-0 w-36 h-36 bg-blue-100/50 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"
          aria-hidden="true"
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
