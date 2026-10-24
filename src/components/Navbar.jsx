import React from 'react';
import { Volume2, VolumeX, Compass } from 'lucide-react';

export const Navbar = React.memo(function Navbar({ activeChapterIndex, chapters, scrollProgress, isAudioPlaying, toggleAudio, onJumpToChapter }) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 md:px-12 py-4 flex items-center justify-between pointer-events-none transition-all duration-500 backdrop-blur-xl bg-white/[0.03] border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.15)]">
      {/* Brand Title */}
      <div className="pointer-events-auto flex items-center gap-3">
        <span className="text-[#D4AF37] text-lg font-cinzel tracking-[0.25em] font-semibold select-none flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
          THE KING'S JOURNEY
        </span>
      </div>

      {/* Chapter Indicator Dots (Desktop) in Glass Container */}
      <nav className="pointer-events-auto hidden md:flex items-center gap-2 bg-white/[0.05] backdrop-blur-xl px-4 py-2 rounded-full border border-white/[0.12] shadow-2xl">
        {chapters.map((ch, idx) => {
          const isActive = idx === activeChapterIndex;
          return (
            <button
              key={ch.id}
              onClick={() => onJumpToChapter(idx)}
              className="group relative flex items-center gap-1.5 py-1 px-2 cursor-pointer transition-all duration-300"
              aria-label={`Jump to ${ch.tag}`}
            >
              <span
                className={`block transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-6 h-1.5 bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]'
                    : 'w-1.5 h-1.5 bg-white/30 group-hover:bg-[#E7C76A]/70'
                }`}
              />
              <span
                className={`text-[10px] tracking-wider uppercase font-cinzel transition-all duration-300 ${
                  isActive
                    ? 'text-[#F5F0E6] opacity-100 font-bold'
                    : 'text-white/40 opacity-0 group-hover:opacity-100'
                }`}
              >
                {ch.chapterNumber}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Ambient Audio & Progress in Frosted Glass */}
      <div className="pointer-events-auto flex items-center gap-4">
        <button
          onClick={toggleAudio}
          className="flex items-center gap-2 text-xs font-sans-ui tracking-widest text-[#E7C76A] hover:text-[#FFF6D6] transition-colors py-2 px-3 rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/[0.12] cursor-pointer shadow-lg"
          title={isAudioPlaying ? "Mute Savanna Ambience" : "Play Savanna Ambience"}
          aria-label="Toggle ambient sound"
        >
          {isAudioPlaying ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
              <span className="hidden sm:inline text-[11px] font-cinzel tracking-wider">SOUND ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-white/50" />
              <span className="hidden sm:inline text-[11px] font-cinzel tracking-wider text-white/60">SOUND OFF</span>
            </>
          )}
        </button>

        {/* Minimal Scroll Percentage in Frosted Glass */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] font-cinzel tracking-widest text-[#D4AF37]/90 bg-white/[0.05] backdrop-blur-xl px-2.5 py-1.5 rounded-full border border-white/[0.12]">
          <span>{Math.round(scrollProgress * 100)}%</span>
        </div>
      </div>
    </header>
  );
});
