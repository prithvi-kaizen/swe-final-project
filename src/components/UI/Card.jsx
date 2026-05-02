import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, index = 0, featured = false, ...props }) => {
  // Compute animation delay based on index
  const delay = `${index * 0.04}s`;

  return (
    <div
      className={twMerge(
        clsx(
          "bg-card border border-borderLight p-5 animate-fade-slide-up relative overflow-hidden", // Base styling
          featured ? "rounded-hero" : "rounded-std",
          // Hover specific tailwind utility classes could be complex with springs, so we use arbitrary values
          "transition-all duration-200 ease-spring",
          "hover:-translate-y-[3px] hover:scale-[1.005] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]",
          className
        )
      )}
      style={{ animationDelay: delay }}
      {...props}
    >
      {children}
    </div>
  );
};
