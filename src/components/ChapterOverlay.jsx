import React from 'react';
import { Volume2 } from 'lucide-react';

export function ChapterOverlay({
  currentChapter,
  currentChapterIndex,
  totalChapters,
  chapterLocalProgress, // 0 to 1 progress within this chapter
  globalProgress, // 0 to 1 overall progress
  onToggleKingAudio,
  onPlayRoarClip,
  isKingAudioOn,
  isPlayingKingVideo
}) {
  if (!currentChapter) return null;

  // Compute text reveal opacity:
  // Smooth bell curve or plateaus in the middle of chapter scroll
  // Enters between 0.0 - 0.2, solid 0.2 - 0.8, exits 0.8 - 1.0
  let textOpacity = 1;
  let textTranslateY = 0;

  if (chapterLocalProgress < 0.15) {
    const factor = chapterLocalProgress / 0.15;
    textOpacity = Math.max(0, Math.min(1, factor));
    textTranslateY = (1 - factor) * 20; // gentle upward float
  } else if (chapterLocalProgress > 0.85) {
    const factor = (1 - chapterLocalProgress) / 0.15;
    textOpacity = Math.max(0, Math.min(1, factor));
    textTranslateY = (1 - factor) * -20; // gentle upward exit
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 sm:p-10 md:p-16 z-30 select-none">
      {/* Top Chapter Metadata & Chapter Counter */}
      <div className="w-full flex items-center justify-between pt-12 md:pt-6">
        <div className="flex items-center gap-3">
          <span className="text-xs md:text-sm font-cinzel font-bold tracking-[0.25em] text-[#E7C76A] uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            CHAPTER {currentChapter.chapterNumber} / 0{totalChapters}
          </span>
          <span className="hidden sm:inline-block text-[11px] font-sans-ui uppercase tracking-widest text-white/60 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            · {currentChapter.accent}
          </span>
        </div>

        {/* Local Chapter Time Indicator */}
        <div className="text-right">
          <span className="text-[11px] sm:text-xs font-cinzel tracking-[0.2em] text-[#D4AF37] font-semibold drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            {Math.round(chapterLocalProgress * 100)}%
          </span>
        </div>
      </div>

      {/* Center Cinematic Editorial Titles */}
      <div
        className="max-w-4xl mx-auto text-center my-auto transition-all duration-300 ease-out px-4"
        style={{
          opacity: textOpacity,
          transform: `translateY(${textTranslateY}px)`
        }}
      >
        {/* Chapter Tag */}
        <span className="inline-block text-xs md:text-sm font-cinzel tracking-[0.35em] text-[#E7C76A] mb-3 uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          {currentChapter.tag}
        </span>

        {/* Majestic Gold Title */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-cinzel font-bold tracking-[0.1em] leading-tight mb-4 text-balance drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
          <span className="gold-text-gradient">{currentChapter.title}</span>
        </h2>

        {/* Delicate Divider */}
        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto my-4 shadow-[0_0_8px_#D4AF37]" />

        {/* Editorial Subtitle */}
        <p className="text-lg sm:text-2xl md:text-3xl font-cormorant italic text-[#F5F0E6] tracking-wide mb-3 drop-shadow-[0_2px_16px_rgba(0,0,0,0.95)]">
          {currentChapter.subtitle}
        </p>

        {/* Evocative Narrative Line */}
        <p className="hidden sm:block text-xs md:text-sm font-sans-ui text-white/85 max-w-xl mx-auto leading-relaxed font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          {currentChapter.story}
        </p>

        {/* Naturalist Reflection (Warm, concise, additive insight from Claude editorial guidelines) */}
        {currentChapter.reflection && (
          <p className="hidden md:block text-xs font-cormorant italic text-[#E7C76A]/90 max-w-lg mx-auto mt-3 tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            "{currentChapter.reflection}"
          </p>
        )}

        {/* Special Native Video Audio Trigger for Chapter 04 (The King) */}
        {currentChapter.id === 4 && (
          <div className="mt-5 pointer-events-auto flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onPlayRoarClip}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full backdrop-blur-xl bg-[#D4AF37] hover:bg-[#FFF6D6] text-black font-cinzel font-bold text-xs tracking-widest shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all transform hover:scale-105 cursor-pointer"
              title="Play The Roar with Original Movie Sound"
            >
              <Volume2 className="w-4 h-4 fill-black" />
              <span>PLAY ROAR WITH MOVIE SOUND</span>
            </button>

            <button
              onClick={onToggleKingAudio}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full backdrop-blur-xl border transition-all duration-300 cursor-pointer text-xs font-cinzel tracking-widest ${
                isKingAudioOn
                  ? 'bg-white/[0.08] text-[#E7C76A] border-[#D4AF37]/40 shadow-sm'
                  : 'bg-black/40 text-white/50 border-white/10'
              }`}
              title="Toggle Video Audio"
            >
              <span>{isKingAudioOn ? "VIDEO AUDIO: ON 🔊" : "VIDEO AUDIO: OFF 🔇"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Progress Bar & Scroll Cue */}
      <div className="w-full pb-4">
        {/* Thin Gold Progress Bar */}
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] font-cinzel tracking-widest text-[#D4AF37]/70">
            <span>BEGINNING</span>
            <span>TIMELINE PROGRESS</span>
            <span>END</span>
          </div>

          <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#FFF6D6] transition-all duration-75 ease-linear shadow-[0_0_10px_#D4AF37]"
              style={{ width: `${Math.max(1, globalProgress * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
