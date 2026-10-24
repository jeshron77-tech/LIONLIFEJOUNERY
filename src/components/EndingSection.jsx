import React from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';

const JOURNEY_STILLS = [
  { id: 'born', label: 'BORN', src: '/images/journey/01-born.jpg' },
  { id: 'grow', label: 'GROW', src: '/images/journey/02-grow.jpg' },
  { id: 'hunt', label: 'HUNT', src: '/images/journey/03-hunter.jpg' },
  { id: 'king', label: 'THE KING', src: '/images/journey/04-king.jpg' },
  { id: 'aging', label: 'AGING', src: '/images/journey/05-aging.jpg' },
  { id: 'new', label: 'NEW KING', src: '/images/journey/06-new-king.jpg' },
];

export const EndingSection = React.memo(function EndingSection({ onReturnToBeginning }) {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 py-28 bg-[#080806] z-20 overflow-hidden text-center">
      {/* Background Editorial Montage: Lion's Life Journey Stills (Born -> Grow -> King -> Aging -> End -> New) */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
        {/* 6-Panel Cinematic Editorial Film Tapestry */}
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-full w-full">
          {JOURNEY_STILLS.map((still, idx) => (
            <div
              key={still.id}
              className="relative h-full w-full overflow-hidden border-r border-white/[0.04] last:border-r-0"
            >
              {/* Photo with film color grading & soft zoom */}
              <img
                src={still.src}
                alt={still.label}
                className="w-full h-full object-cover object-center filter brightness-[0.38] contrast-[1.12] saturate-[0.85] transition-transform duration-1000 scale-105"
                loading="lazy"
              />

              {/* Individual panel subtle vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080806] via-transparent to-[#080806]/80" />

              {/* Editorial label at base of each panel */}
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <span className="text-[9px] md:text-[10px] font-cinzel tracking-[0.3em] text-[#D4AF37]/50 uppercase font-semibold">
                  {still.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Global Cinematic Dusk Radial Vignette & Warm Savanna Glow */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#080806]/70 to-[#080806]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080806] via-transparent to-[#080806]" />

        {/* Center Golden Nebular Light Bloom */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[550px] bg-gradient-to-tr from-[#D4AF37]/15 via-[#B8860B]/10 to-transparent rounded-full blur-[160px]" />
      </div>

      {/* Foreground Content */}
      <div className="relative max-w-4xl mx-auto flex flex-col items-center z-10">
        {/* Decorative Golden Icon */}
        <div className="w-12 h-12 rounded-full border border-[#D4AF37]/35 flex items-center justify-center mb-10 bg-[#15130F]/80 backdrop-blur-md shadow-[0_0_25px_rgba(212,175,55,0.25)]">
          <Sparkles className="w-5 h-5 text-[#D4AF37]" />
        </div>

        {/* Poetic Stanzas Revealed with Dignity & Restraint */}
        <div className="flex flex-col gap-6 mb-16 drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
          <p className="text-xl sm:text-2xl md:text-3xl font-cinzel tracking-[0.2em] text-[#E7C76A] font-semibold">
            EVERY KING HAS A BEGINNING.
          </p>
          <div className="w-8 h-[1px] bg-[#D4AF37]/40 mx-auto" />
          <p className="text-xl sm:text-2xl md:text-3xl font-cinzel tracking-[0.2em] text-[#D4AF37] font-semibold">
            EVERY REIGN HAS AN END.
          </p>
          <div className="w-8 h-[1px] bg-[#D4AF37]/40 mx-auto" />
          <p className="text-xl sm:text-2xl md:text-3xl font-cinzel tracking-[0.2em] text-[#FFF6D6] font-bold">
            A NEW KING RISES.
          </p>
          <div className="w-8 h-[1px] bg-[#D4AF37]/40 mx-auto" />
          <p className="text-base sm:text-xl font-cormorant italic tracking-[0.2em] text-[#D4AF37]">
            LIFE ALWAYS CONTINUES.
          </p>
        </div>

        {/* Climax Branding */}
        <div className="pt-8 border-t border-[#D4AF37]/20 w-full max-w-xl flex flex-col items-center">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-cinzel font-bold tracking-[0.15em] mb-4 select-none drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
            <span className="gold-text-gradient">THE KING'S JOURNEY</span>
          </h2>

          <p className="text-sm sm:text-base font-cormorant italic tracking-[0.25em] text-[#F5F0E6]/90 uppercase mb-12 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            A STORY WRITTEN BY NATURE.
          </p>

          {/* Minimal Return to Beginning Button */}
          <button
            onClick={onReturnToBeginning}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#15130F] border border-[#D4AF37]/40 hover:border-[#D4AF37] transition-all duration-500 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_35px_rgba(212,175,55,0.35)]"
            aria-label="Return to the beginning"
          >
            <span className="text-xs sm:text-sm font-cinzel font-semibold tracking-[0.25em] text-[#E7C76A] group-hover:text-[#FFF6D6] transition-colors">
              RETURN TO THE BEGINNING ↑
            </span>
            <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center group-hover:bg-[#D4AF37] transition-colors">
              <ArrowUp className="w-3.5 h-3.5 text-[#D4AF37] group-hover:text-black transition-colors" />
            </div>
          </button>
        </div>

        {/* Footer Credit & Copyright */}
        <div className="mt-20 text-[11px] font-sans-ui tracking-widest text-white/30 uppercase">
          A Cinematic Wildlife Tribute · Captured in 4K · Inspired by Nature
        </div>
      </div>
    </section>
  );
});
