import React from 'react';

export const ProductLoader = ({ text = "Chargement..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 w-full text-center">
      {/* Pulsing shoe SVG */}
      <div className="text-accent animate-pulse mb-3">
        <svg
          className="w-12 h-12 stroke-[1.5]"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Heel */}
          <path d="M15 70 L20 80 L35 80 L35 70" />
          {/* Sole */}
          <path d="M35 70 C50 72 70 70 85 70" strokeWidth="2.5" />
          {/* Upper body */}
          <path d="M15 70 C10 55 18 48 32 45 C38 45 42 35 48 32 C52 29 60 30 65 35 C70 40 75 48 85 58 C90 62 90 68 85 70" />
          {/* Laces */}
          <path d="M42 35 L47 40 M45 32 L50 37 M48 29 L53 34" strokeWidth="1.2" />
          {/* Stitching */}
          <path d="M32 45 C40 46 48 50 55 58" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />
        </svg>
      </div>
      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] animate-pulse-soft">
        {text}
      </span>
    </div>
  );
};

export default ProductLoader;
