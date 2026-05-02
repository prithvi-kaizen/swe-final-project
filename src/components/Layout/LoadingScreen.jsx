import React from 'react';
import { useData } from '../../contexts/DataContext';
import { PixelFootball } from '../PixelArt';

export const LoadingScreen = () => {
  const { progress, currentFile, error } = useData();

  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-bg text-red">
        <h1 className="text-2xl font-bold mb-4">Error Loading Data</h1>
        <p className="font-mono">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-bg text-inkPrimary">
      <div className="mb-8 animate-bounce">
        <PixelFootball pixelSize={8} />
      </div>

      <h1 className="text-xl font-bold mb-6 tracking-tight uppercase text-accentPrimary">Loading Archive</h1>

      <div className="w-64 h-2 bg-card border border-borderLight rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-accentPrimary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-col items-center gap-1 font-mono text-sm text-inkMuted">
        <span>{progress}%</span>
        <span className="text-[10px] uppercase">Parsing: {currentFile}</span>
      </div>
    </div>
  );
};
