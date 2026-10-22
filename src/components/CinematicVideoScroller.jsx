import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChapterOverlay } from './ChapterOverlay';
import { Play, Pause, AlertCircle, Volume2 } from 'lucide-react';

export function CinematicVideoScroller({
  chapters,
  onActiveChapterChange,
  onGlobalProgressChange,
  containerRef
}) {
  const [durations, setDurations] = useState(() => chapters.map(c => c.defaultDuration));
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [localProgress, setLocalProgress] = useState(0);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(() => chapters.map(() => false));
  const [videoErrors, setVideoErrors] = useState(() => chapters.map(() => false));
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isKingAudioOn, setIsKingAudioOn] = useState(true);

  // Video element references & exact scroll scrub state
  const videoRefs = useRef([]);
  const lastTargetTimeRef = useRef(chapters.map(() => -1));
  const rafPendingRef = useRef(false);
  const autoPlayAnimRef = useRef(null);

  // Update real duration when video metadata arrives
  const handleLoadedMetadata = (index, e) => {
    const video = e.target;
    if (video && video.duration && !isNaN(video.duration) && video.duration > 0) {
      setDurations(prev => {
        const next = [...prev];
        next[index] = video.duration;
        return next;
      });
    }
    setVideoLoaded(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });

    video.pause();
    try {
      video.currentTime = 0;
    } catch (_) {}
  };

  const handleVideoError = (index, e) => {
    console.warn(`Video ${chapters[index].video} error:`, e);
    setVideoErrors(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  // Get current scroll progress through the pinned video stage (0.0 to 1.0)
  const getScrollProgress = useCallback(() => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const containerTop = scrollY + rect.top;
    const totalScrollableHeight = rect.height - window.innerHeight;

    if (totalScrollableHeight <= 0) return 0;
    const currentScrollWithin = scrollY - containerTop;
    return Math.max(0, Math.min(1, currentScrollWithin / totalScrollableHeight));
  }, [containerRef]);

  // Exact event-driven rAF video scrub from scroll
  const updateVideoFromScroll = useCallback(() => {
    if (rafPendingRef.current) return;

    rafPendingRef.current = true;

    requestAnimationFrame(() => {
      rafPendingRef.current = false;

      const progress = Math.max(0, Math.min(1, getScrollProgress()));
      const chapterCount = chapters.length;

      // Exact 1-to-1 chapter indexing: each chapter gets exactly 1/6th of the scroll track
      const rawPosition = progress * chapterCount;
      const chIndex = Math.min(chapterCount - 1, Math.floor(rawPosition));
      const chLocalProg = Math.max(0, Math.min(1, rawPosition - chIndex));

      setActiveChapterIndex(chIndex);
      setLocalProgress(chLocalProg);
      setGlobalProgress(progress);
      onActiveChapterChange?.(chIndex);
      onGlobalProgressChange?.(progress);

      const activeVideo = videoRefs.current[chIndex];
      if (activeVideo) {
        const vidDuration = (activeVideo.duration && !isNaN(activeVideo.duration) && activeVideo.duration > 0)
          ? activeVideo.duration
          : (durations[chIndex] || chapters[chIndex].defaultDuration);

        const targetTime = chLocalProg * vidDuration;

        // Update video currentTime on frame change (>0.001s threshold)
        if (Math.abs(targetTime - lastTargetTimeRef.current[chIndex]) > 0.001) {
          activeVideo.currentTime = targetTime;
          lastTargetTimeRef.current[chIndex] = targetTime;
        }

        // Special handling for Chapter 04 (The King): Unmute when active if audio enabled
        if (chIndex === 3 && isKingAudioOn) {
          if (activeVideo.muted) activeVideo.muted = false;
          activeVideo.volume = 1.0;
        }
      }

      // Pre-seek next video to 0s when approaching boundary
      if (chIndex < chapterCount - 1 && chLocalProg > 0.80) {
        const nextVideo = videoRefs.current[chIndex + 1];
        if (nextVideo && nextVideo.currentTime > 0.05) {
          nextVideo.currentTime = 0;
          lastTargetTimeRef.current[chIndex + 1] = 0;
        }
      }

      // Pre-seek previous video to end when rewinding
      if (chIndex > 0 && chLocalProg < 0.20) {
        const prevVideo = videoRefs.current[chIndex - 1];
        const prevDuration = durations[chIndex - 1] || chapters[chIndex - 1].defaultDuration;
        if (prevVideo && Math.abs(prevVideo.currentTime - prevDuration) > 0.05) {
          prevVideo.currentTime = prevDuration;
          lastTargetTimeRef.current[chIndex - 1] = prevDuration;
        }
      }
    });
  }, [chapters, durations, getScrollProgress, onActiveChapterChange, onGlobalProgressChange, isKingAudioOn]);

  // Bind passive window scroll listener
  useEffect(() => {
    window.addEventListener("scroll", updateVideoFromScroll, { passive: true });
    updateVideoFromScroll(); // Initial position

    return () => {
      window.removeEventListener("scroll", updateVideoFromScroll);
    };
  }, [updateVideoFromScroll]);

  // Autoplay / Cinematic Auto-Advance Assist
  useEffect(() => {
    if (!isAutoPlaying) {
      if (autoPlayAnimRef.current) cancelAnimationFrame(autoPlayAnimRef.current);
      return;
    }

    let lastTimestamp = performance.now();
    const totalDurationSeconds = durations.reduce((a, b) => a + b, 0);

    const advancePlayback = (now) => {
      const delta = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const totalScrollableHeight = rect.height - window.innerHeight;
        const scrollIncrement = (delta / totalDurationSeconds) * totalScrollableHeight;

        window.scrollBy({
          top: scrollIncrement,
          behavior: 'auto'
        });

        if (window.scrollY >= containerRef.current.offsetTop + totalScrollableHeight - 10) {
          setIsAutoPlaying(false);
          return;
        }
      }

      autoPlayAnimRef.current = requestAnimationFrame(advancePlayback);
    };

    autoPlayAnimRef.current = requestAnimationFrame(advancePlayback);

    return () => {
      if (autoPlayAnimRef.current) cancelAnimationFrame(autoPlayAnimRef.current);
    };
  }, [isAutoPlaying, containerRef, durations]);

  // Interactive scrubber jump
  const handleScrubChange = (e) => {
    const targetProg = parseFloat(e.target.value);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const containerTop = window.scrollY + rect.top;
    const totalScrollableHeight = rect.height - window.innerHeight;
    const targetY = containerTop + targetProg * totalScrollableHeight;

    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
  };

  // Toggle King Video Audio
  const handleToggleKingAudio = useCallback(() => {
    setIsKingAudioOn(prev => {
      const next = !prev;
      const kingVid = videoRefs.current[3];
      if (kingVid) {
        kingVid.muted = !next;
        kingVid.volume = 1.0;
      }
      return next;
    });
  }, []);

  // Explicitly play the roaring sequence with full movie sound
  const handlePlayRoarClip = useCallback(() => {
    const kingVid = videoRefs.current[3];
    if (kingVid) {
      kingVid.muted = false;
      kingVid.volume = 1.0;
      setIsKingAudioOn(true);
      kingVid.currentTime = 1.8;
      kingVid.play().catch(e => console.log('Audio requires user gesture:', e));
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: `${chapters.length * 110}vh` }} // 660vh total scroll depth for velvety 1:1 scrub precision
    >
      {/* Sticky Fullscreen Stage */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[#080806] flex items-center justify-center">
        {/* Layered 6 Video Elements with Zero-Latency Opacity Blending */}
        <div className="relative w-full h-full">
          {chapters.map((chapter, idx) => {
            const isActive = idx === activeChapterIndex;
            const isNext = idx === activeChapterIndex + 1;
            const isPrev = idx === activeChapterIndex - 1;

            // Silky cross-fade across chapter thresholds
            let opacity = 0;
            if (isActive) {
              if (localProgress > 0.88 && isNext) {
                opacity = 1 - (localProgress - 0.88) / 0.12;
              } else if (localProgress < 0.12 && isPrev) {
                opacity = localProgress / 0.12;
              } else {
                opacity = 1;
              }
            } else if (isNext && localProgress > 0.88) {
              opacity = (localProgress - 0.88) / 0.12;
            } else if (isPrev && localProgress < 0.12) {
              opacity = 1 - (localProgress / 0.12);
            }

            const isRendered = isActive || isNext || isPrev;

            return (
              <div
                key={chapter.id}
                className="absolute inset-0 w-full h-full transition-opacity duration-100 ease-out"
                style={{
                  opacity: isRendered ? Math.max(0, Math.min(1, opacity)) : 0,
                  visibility: opacity > 0.005 ? 'visible' : 'hidden',
                  zIndex: isActive ? 10 : isNext ? 9 : 8
                }}
              >
                <video
                  ref={el => (videoRefs.current[idx] = el)}
                  src={chapter.video}
                  muted={idx !== 3 || !isKingAudioOn}
                  playsInline
                  preload="auto"
                  onLoadedMetadata={(e) => handleLoadedMetadata(idx, e)}
                  onSeeked={() => handleSeeked(idx)}
                  onError={(e) => handleVideoError(idx, e)}
                  className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05]"
                  style={{ willChange: 'opacity, transform' }}
                />

                {/* Video Error Fallback */}
                {videoErrors[idx] && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#15130F] p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-[#D4AF37] mb-4" />
                    <h3 className="text-xl font-cinzel text-[#E7C76A] mb-2">{chapter.title}</h3>
                    <p className="text-sm text-white/60 font-sans-ui max-w-md">
                      Video file "{chapter.video}" is buffering or resolving. Please check the public/videos folder.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Cinematic Vignettes and Contrast Enhancement Gradients */}
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="absolute inset-0 cinematic-vignette" />
          <div className="absolute top-0 left-0 w-full h-36 cinematic-overlay-top" />
          <div className="absolute bottom-0 left-0 w-full h-44 cinematic-overlay-bottom" />
        </div>

        {/* Dynamic Chapter Text Overlay (Directly synchronized 1:1 with current chapter) */}
        <ChapterOverlay
          currentChapter={chapters[activeChapterIndex]}
          currentChapterIndex={activeChapterIndex}
          totalChapters={chapters.length}
          chapterLocalProgress={localProgress}
          globalProgress={globalProgress}
          onToggleKingAudio={handleToggleKingAudio}
          onPlayRoarClip={handlePlayRoarClip}
          isKingAudioOn={isKingAudioOn}
        />

        {/* Floating Quick Play/Scrub Assist Bar */}
        <div className="absolute bottom-6 left-6 z-40 flex items-center gap-3 bg-white/[0.05] backdrop-blur-xl px-4 py-2 rounded-full border border-white/[0.12] shadow-2xl pointer-events-auto">
          <button
            onClick={() => setIsAutoPlaying(prev => !prev)}
            className="flex items-center gap-2 text-xs font-cinzel text-[#E7C76A] hover:text-[#FFF6D6] transition-colors cursor-pointer"
            title={isAutoPlaying ? "Pause Auto-Scrub" : "Cinematic Auto-Play"}
            aria-label="Toggle auto play assist"
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                <span className="hidden sm:inline">AUTOPLAY</span>
              </>
            )}
          </button>

          <div className="h-3 w-[1px] bg-white/20" />

          {/* Real-time Chapter Code */}
          <div className="flex items-center gap-2 text-[11px] font-cinzel text-white/80 tracking-wider">
            <span>CH {chapters[activeChapterIndex]?.chapterNumber}</span>
            <span className="text-white/40">· {Math.round(localProgress * 100)}%</span>
          </div>

          <div className="h-3 w-[1px] bg-white/20 hidden sm:block" />

          {/* Interactive Scrub Slider for Precision Review */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={globalProgress || 0}
            onChange={handleScrubChange}
            className="w-20 sm:w-28 accent-[#D4AF37] cursor-pointer h-1.5 rounded-lg bg-white/20"
            title="Drag to scrub timeline"
            aria-label="Timeline scrubber"
          />
        </div>
      </div>
    </div>
  );
}
