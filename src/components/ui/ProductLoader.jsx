import React from 'react';

export const ProductLoader = ({ text = "Chargement...", compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 w-full text-center">
        <div className="text-accent animate-pulse">
          <svg
            className="w-5 h-5 stroke-2"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Collar / opening */}
            <path d="M 28 32 C 34 38, 44 38, 52 30" />
            {/* Back heel counter */}
            <path d="M 28 32 C 24 37, 22 41, 22 44" />
            {/* Inside dividing line */}
            <path d="M 28 32 C 35 45, 45 55, 58 65" />
            {/* Vamp / Front profile */}
            <path d="M 52 30 C 60 40, 70 50, 78 56" />
            {/* Toe cap curve */}
            <path d="M 78 56 C 80 59, 78 62, 76 63" />
            {/* Sole top line */}
            <path d="M 22 44 L 58 65 L 76 63" />
            {/* Laces */}
            <path d="M 48 42 L 54 36" />
            <path d="M 52 46 L 58 40" />
            <path d="M 56 50 L 62 44" />
            {/* Thick 3D sole bottom */}
            <path d="M 22 49 L 56 73 L 74 71" />
            {/* Heel sole line */}
            <path d="M 22 44 L 22 49" />
            {/* Toe sole line */}
            <path d="M 76 63 L 74 71" />
            {/* Inner sole bevel line */}
            <path d="M 22 46.5 L 57 70 L 75 68" strokeWidth={1.2} />
          </svg>
        </div>
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] animate-pulse-soft">
          {text}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 w-full text-center">
      {/* Pulsing shoe SVG */}
      <div className="text-accent animate-pulse mb-3">
        <svg
          className="w-12 h-12 stroke-2"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Collar / opening */}
          <path d="M 28 32 C 34 38, 44 38, 52 30" />
          {/* Back heel counter */}
          <path d="M 28 32 C 24 37, 22 41, 22 44" />
          {/* Inside dividing line */}
          <path d="M 28 32 C 35 45, 45 55, 58 65" />
          {/* Vamp / Front profile */}
          <path d="M 52 30 C 60 40, 70 50, 78 56" />
          {/* Toe cap curve */}
          <path d="M 78 56 C 80 59, 78 62, 76 63" />
          {/* Sole top line */}
          <path d="M 22 44 L 58 65 L 76 63" />
          {/* Laces */}
          <path d="M 48 42 L 54 36" />
          <path d="M 52 46 L 58 40" />
          <path d="M 56 50 L 62 44" />
          {/* Thick 3D sole bottom */}
          <path d="M 22 49 L 56 73 L 74 71" />
          {/* Heel sole line */}
          <path d="M 22 44 L 22 49" />
          {/* Toe sole line */}
          <path d="M 76 63 L 74 71" />
          {/* Inner sole bevel line */}
          <path d="M 22 46.5 L 57 70 L 75 68" strokeWidth={1} />
        </svg>
      </div>
      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] animate-pulse-soft">
        {text}
      </span>
    </div>
  );
};

export default ProductLoader;
