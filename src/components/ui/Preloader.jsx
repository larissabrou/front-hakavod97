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
            className="w-24 h-24 stroke-[1.5]"
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
            {/* Upper body outline */}
            <path d="M15 70 C10 55 18 48 32 45 C38 45 42 35 48 32 C52 29 60 30 65 35 C70 40 75 48 85 58 C90 62 90 68 85 70" />
            {/* Laces details */}
            <path d="M42 35 L47 40 M45 32 L50 37 M48 29 L53 34" strokeWidth="1.2" />
            {/* Stitching details */}
            <path d="M32 45 C40 46 48 50 55 58" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />
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
