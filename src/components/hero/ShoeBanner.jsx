import React from 'react';

/**
 * ShoeBanner – full‑screen hero displaying a high‑resolution shoe image or video.
 * Props:
 *   - src: image or video URL
 *   - type: 'image' | 'video' (default: 'image')
 *   - title: main heading text
 *   - subtitle: supporting text
 *   - ctaLabel: text for the call‑to‑action button
 *   - ctaLink: destination URL
 */
export const ShoeBanner = ({
  src,
  type = 'image',
  title = 'Luxe à vos pieds',
  subtitle = 'Découvrez notre collection exclusive de chaussures haut‑de‑gamme',
  ctaLabel = 'Voir la collection',
  ctaLink = '/catalog',
}) => {
  return (
    <section className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden flex items-center justify-center">
      {type === 'video' ? (
        <video
          src={src}
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={src}
          alt="Hero banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 text-center max-w-2xl px-4">
        <span className="text-xs font-bold tracking-widest uppercase bg-accent text-white px-2 py-1 rounded">
          Nouvelle Collection
        </span>
        <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase">
          {title}
        </h1>
        <p className="mt-4 text-base md:text-lg text-neutral-200">
          {subtitle}
        </p>
        <a
          href={ctaLink}
          className="mt-6 inline-block bg-white text-neutral-900 hover:bg-accent hover:text-white font-bold px-8 py-3.5 transition-colors duration-200 text-sm uppercase tracking-wider rounded-sm shadow-md"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
};

export default ShoeBanner;
