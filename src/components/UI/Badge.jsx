import React from 'react';
import clsx from 'clsx';

export const Badge = ({ children, color = 'green', className }) => {
  const colorStyles = {
    green: 'bg-accentLight text-accentPrimary',
    gold: 'bg-goldLight text-gold',
    red: 'bg-redLight text-red',
    blue: 'bg-blueLight text-blue'
  };

  return (
    <span className={clsx(
      "inline-flex items-center justify-center font-sans tracking-tight",
      "text-[10px] uppercase font-semibold rounded-full px-[8px] py-[3px]",
      colorStyles[color],
      className
    )}>
      {children}
    </span>
  );
};
