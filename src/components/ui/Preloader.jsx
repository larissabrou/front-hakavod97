import React, { useEffect, useState } from 'react';

export const Preloader = () => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the preloader in this session
    const hasSeen = sessionStorage.getItem('has_seen_preloader');
    if (hasSeen === 'true') {
      setVisible(false);
      return;
    }

    // Start filling the progress bar
    const progressTimer = setTimeout(() => {
      setProgress(true);
    }, 50);

    // Fade out after 1.5 seconds of display
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 1500);

    // Completely remove from DOM after the fade transition
    const removeTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('has_seen_preloader', 'true');
    }, 2000);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#faf8f5] transition-opacity duration-500 ease-in-out ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center max-w-xs w-full px-6 text-center">
        {/* Sleek Dress Shoe SVG */}
        <div className="relative mb-8 text-accent animate-float">
          <svg
            className="w-24 h-24 stroke-2"
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

        {/* Brand Text */}
        <h2 className="text-xl font-serif font-bold text-neutral-900 tracking-[0.25em] uppercase mb-1 animate-pulse-soft">
          HA-KAVOD 97
        </h2>
        <p className="text-[9px] font-sans font-bold text-accent tracking-[0.4em] uppercase mb-8">
          Maison de Haute Couture
        </p>

        {/* Progress Bar */}
        <div className="w-32 h-[2px] bg-neutral-200 overflow-hidden relative rounded-full">
          <div
            className="absolute top-0 bottom-0 left-0 bg-primary w-full origin-left transition-transform"
            style={{
              transform: progress ? 'scaleX(1)' : 'scaleX(0)',
              transitionDuration: '1450ms',
              transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
