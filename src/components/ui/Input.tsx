import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full p-3 border border-neutral-300 rounded-lg focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-200 transition-colors ${className.replace(/\bw-full\b/g, '')}`}
      {...props}
    />
  )
);

Input.displayName = 'Input'; 