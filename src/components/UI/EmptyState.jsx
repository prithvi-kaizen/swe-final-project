import React from 'react';
import { Card } from './Card';
import { PixelPitch } from '../PixelArt';

export const EmptyState = ({ title }) => {
  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center pt-10">
      <Card index={0} className="max-w-md w-full text-center flex flex-col items-center p-10 bg-cardSecondary border-dashed border-2">
         <div className="opacity-30 mb-6">
           <PixelPitch width={150} height={100} />
         </div>
         <h2 className="text-xl font-bold mb-2 tracking-tight">{title}</h2>
         <p className="text-sm text-inkMuted">This visualization is currently under construction. Check back soon for deep historical analytics.</p>
      </Card>
    </div>
  );
};
