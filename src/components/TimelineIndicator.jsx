import React from 'react';

export const TimelineIndicator = React.memo(function TimelineIndicator({ chapters, activeChapterIndex, onSelectChapter, globalProgress }) {
  return (
    <aside
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-5 select-none pointer-events-auto"
      aria-label="Story Chapter Navigation"
    >
      <div className="flex flex-col gap-3.5 items-end">
        {chapters.map((ch, idx) => {
          const isActive = idx === activeChapterIndex;
          return (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(idx)}
              className="group flex items-center justify-end gap-3 cursor-pointer text-right transition-all duration-300 focus:outline-none"
              title={`Jump to Chapter ${ch.chapterNumber}: ${ch.title}`}
            >
              {/* Tooltip Label on Hover / Active */}
              <div
                className={`flex flex-col transition-all duration-300 transform ${
                  isActive
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                }`}
              >
                <span className="text-[10px] font-cinzel font-bold tracking-widest text-[#D4AF37] whitespace-nowrap">
                  {ch.chapterNumber} · {ch.tag.split('·')[1]?.trim()}
                </span>
              </div>

              {/* Indicator Pill/Line */}
              <div className="relative flex items-center justify-center">
                <div
                  className={`transition-all duration-500 rounded-full ${
                    isActive
                      ? 'w-7 h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#FFF6D6] shadow-[0_0_12px_#D4AF37]'
                      : 'w-2 h-1.5 bg-white/20 group-hover:bg-[#E7C76A]/60'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
});
