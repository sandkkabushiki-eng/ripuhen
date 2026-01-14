'use client';

import { HTMLAttributes, forwardRef, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated';
  hover?: boolean;
  children: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', hover = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border',
      glass: 'glass',
      elevated: 'bg-white dark:bg-dark-card shadow-xl shadow-gray-200/50 dark:shadow-black/30',
    };

    return (
      <div
        ref={ref}
        className={`rounded-xl p-5 ${variants[variant]} ${hover ? 'card-hover' : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
