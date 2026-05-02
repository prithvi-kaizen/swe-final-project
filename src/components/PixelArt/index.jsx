import React from 'react';

// Generates a pixel art grid from a string array where characters map to colors
const generatePixelArt = (grid, colorMap, pixelSize = 4, className = '', svgProps = {}) => {
  const height = grid.length * pixelSize;
  const width = Math.max(...grid.map(r => r.length)) * pixelSize;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} {...svgProps} xmlns="http://www.w3.org/2000/svg">
      {grid.map((row, y) =>
        row.split('').map((char, x) => {
          if (char === ' ' || !colorMap[char]) return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x * pixelSize}
              y={y * pixelSize}
              width={pixelSize}
              height={pixelSize}
              fill={colorMap[char]}
            />
          );
        })
      )}
    </svg>
  );
};

export const PixelFootball = ({ className, pixelSize = 4, opacity = 1 }) => {
  const grid = [
    "      XXXXXX      ",
    "    XX......XX    ",
    "   X..........X   ",
    "  X.....OO.....X  ",
    " X....OOOOOO....X ",
    " X...OOOOOOOO...X ",
    "X.....OOOOOO.....X",
    "X...O........O...X",
    "X..OO........OO..X",
    "X..OO........OO..X",
    "X...O........O...X",
    "X.....OOOOOO.....X",
    " X...OOOOOOOO...X ",
    " X....OOOOOO....X ",
    "  X.....OO.....X  ",
    "   X..........X   ",
    "    XX......XX    ",
    "      XXXXXX      "
  ];

  const colorMap = {
    'X': '#1A1A1A',
    '.': '#FAFAF7',
    'O': '#1A1A1A'
  };

  return generatePixelArt(grid, colorMap, pixelSize, className, { opacity });
};

export const PixelTrophy = ({ className, pixelSize = 4, opacity = 1 }) => {
  const grid = [
    "      OOOOOOOO      ",
    "    XXOOOOOOOOXX    ",
    "   XXXOOOOOOOOXXX   ",
    "   XXXOOOOOOOOXXX   ",
    "    XXOOOOOOOOXX    ",
    "      OOOOOOOO      ",
    "       OOOOOO       ",
    "       OOOOOO       ",
    "        OOOO        ",
    "        OOOO        ",
    "         OO         ",
    "         OO         ",
    "        DDDD        ",
    "       DDDDDD       ",
    "      DDDDDDDD      ",
    "      DDDDDDDD      ",
    "     XXXXXXXXXX     ",
    "     XXXXXXXXXX     "
  ];

  const colorMap = {
    'O': '#D4A017', // Gold
    'D': '#B8860B', // Dark gold
    'X': '#555550'  // Base
  };

  return generatePixelArt(grid, colorMap, pixelSize, className, { opacity });
};

export const PixelPitch = ({ className, width = 300, height = 200 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 100 60" className={`w-full h-full ${className}`} xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {/* Grass Base */}
      <rect x="0" y="0" width="100" height="60" fill="#2D5A27" />
      {/* Lines */}
      <rect x="5" y="5" width="90" height="50" fill="none" stroke="#C8E6C0" strokeWidth="1" />
      <rect x="49.5" y="5" width="1" height="50" fill="#C8E6C0" />
      <rect x="42" y="22" width="16" height="16" fill="none" stroke="#C8E6C0" strokeWidth="1" />
      {/* Penalty areas */}
      <rect x="5" y="15" width="12" height="30" fill="none" stroke="#C8E6C0" strokeWidth="1" />
      <rect x="83" y="15" width="12" height="30" fill="none" stroke="#C8E6C0" strokeWidth="1" />
      {/* Goal areas */}
      <rect x="5" y="24" width="4" height="12" fill="none" stroke="#C8E6C0" strokeWidth="1" />
      <rect x="91" y="24" width="4" height="12" fill="none" stroke="#C8E6C0" strokeWidth="1" />

      {/* Players (Red vs Blue) */}
      <rect x="25" y="20" width="2" height="2" fill="#C0392B" />
      <rect x="22" y="35" width="2" height="2" fill="#C0392B" />
      <rect x="40" y="28" width="2" height="2" fill="#C0392B" />

      <rect x="75" y="18" width="2" height="2" fill="#1A3A5C" />
      <rect x="70" y="42" width="2" height="2" fill="#1A3A5C" />
      <rect x="60" y="29" width="2" height="2" fill="#1A3A5C" />

      {/* Ball */}
      <rect x="53" y="32" width="1" height="1" fill="#FAFAF7" />
    </svg>
  );
};

export const PixelGrass = ({ className, width="100%", height="24" }) => {
  // Generate a random-looking but deterministic grass array using math sin
  const blades = [];
  for (let i = 0; i < 200; i++) {
    const height = 4 + Math.abs(Math.sin(i * 1.3) * 12) + Math.abs(Math.cos(i * 4.7) * 4);
    blades.push(height);
  }

  return (
    <svg width={width} height={height} className={className} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
      {blades.map((h, i) => (
        <rect key={i} x={`${i * 0.5}%`} y={24 - h} width="0.5%" height={h} fill={i % 3 === 0 ? "#2D5A27" : "#C8E6C0"} opacity={i % 3 === 0 ? 0.8 : 0.4} />
      ))}
    </svg>
  );
};
