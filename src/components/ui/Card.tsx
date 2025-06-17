import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  const baseClasses = 'rounded-lg border border-neutral-200 bg-white shadow-sm';
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;
  
  return (
    <div
      className={combinedClasses}
      {...props}
    >
      {children}
    </div>
  );
} 