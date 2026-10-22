import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { CHAPTERS } from "../data/chapters";
import "./ScrollVideoJourney.css";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function ScrollVideoJourney({
  onActiveChapterChange,
  onProgressChange,
  containerRef: externalContainerRef,
}) {
  const localContainerRef = useRef(null);
  const containerRef = externalContainerRef || localContainerRef;

  const videoRefs = useRef([]);
  const activeIndexRef = useRef(0);
  const rafRef = useRef(0);

  const lastTargetFrameRef = useRef(CHAPTERS.map(() => -1));
  const lastTargetTimeRef = useRef(CHAPTERS.map(() => -1));
  const lastReportedPercentRef = useRef(-1);

  // Diagnostics & performance measurement
  const [debugMode, setDebugMode] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("debug") === "true";
    }
    return false;
  });

  const [activeChapter, setActiveChapter] = useState(0);
  const [isInsideJourney, setIsInsideJourney] = useState(false);
  const [isCubWalking, setIsCubWalking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [debugStats, setDebugStats] = useState({
    rAFHz: 60,
    mediaTime: 0,
    targetTime: 0,
    targetFrame: 0,
    totalFrames: 192,
    progress: 0,
    journeyProgress: 0,
  });

  // Performance telemetry refs
  const perfRef = useRef({
    rafFrames: 0,
    lastRafTime: performance.now(),
    currentRafHz: 60,
  });

  // King Audio Controller (Chapter 04: The King - Original Lion Roar Audio Track)
  const pauseKingAudio = useCallback(() => {
    const king = videoRefs.current[3];
    if (!king) return;
    king.pause();
    king.muted = true;
    setAudioEnabled(false);
  }, []);

  const playKingAudio = useCallback(async () => {
    const king = videoRefs.current[3];
    if (!king) return;

    try {
      if (audioEnabled) {
        pauseKingAudio();
        return;
      }
      king.muted = false;
      king.volume = 1;
      await king.play();
      setAudioEnabled(true);
    } catch (err) {
      console.warn("Audio playback blocked or error:", err);
      king.muted = true;
      setAudioEnabled(false);
    }
  }, [audioEnabled, pauseKingAudio]);

  // Direct, deadlock-free seek execution
  const performSeek = useCallback((videoIndex, targetTime, targetFrame) => {
    const video = videoRefs.current[videoIndex];
    if (!video || !Number.isFinite(targetTime)) return;

    lastTargetFrameRef.current[videoIndex] = targetFrame;
    lastTargetTimeRef.current[videoIndex] = targetTime;

    // Direct assignment - All-I-Frame MP4 decodes target frame instantaneously
    video.currentTime = targetTime;
  }, []);

  // Main Coordinated Animation & Continuous Scroll Timeline Loop
  const updateTimeline = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;

      // 1. Calculate FPS telemetry
      const now = performance.now();
      perfRef.current.rafFrames++;
      if (now - perfRef.current.lastRafTime >= 1000) {
        perfRef.current.currentRafHz = Math.round(
          (perfRef.current.rafFrames * 1000) / (now - perfRef.current.lastRafTime)
        );
        perfRef.current.rafFrames = 0;
        perfRef.current.lastRafTime = now;
      }

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalScrollDistance = container.offsetHeight - window.innerHeight;
      if (totalScrollDistance <= 0) return;

      // Continuous 0.0 to 1.0 journey progress
      const journeyProgress = clamp(-rect.top / totalScrollDistance, 0, 1);
      const inJourney = rect.top <= 0 && rect.bottom >= 0;
      setIsInsideJourney(inJourney);

      // Map seamlessly across all 6 chapters without dead zones
      const chapterCount = CHAPTERS.length;
      const chapterFloat = journeyProgress * chapterCount;
      const activeIdx = Math.min(chapterCount - 1, Math.floor(chapterFloat));
      const localProgress = Math.min(1, chapterFloat - activeIdx);

      // In Chapter 6, track when lion cub steps forward
      if (activeIdx === 5) {
        setIsCubWalking(localProgress > 0.45);
      } else {
        setIsCubWalking(false);
      }

      // Handle active chapter switch
      if (activeIndexRef.current !== activeIdx) {
        const prevIndex = activeIndexRef.current;
        activeIndexRef.current = activeIdx;
        setActiveChapter(activeIdx);
        onActiveChapterChange?.(activeIdx);

        // Sound isolation: silence Chapter 4 King audio when leaving
        if (prevIndex === 3 || activeIdx !== 3) {
          const king = videoRefs.current[3];
          if (king && !king.paused) {
            king.pause();
            king.muted = true;
          }
          setAudioEnabled(false);
        }
      }

      // Throttled global progress dispatch (prevents excessive React re-renders)
      const currentPercent = Math.round(journeyProgress * 100);
      if (currentPercent !== lastReportedPercentRef.current) {
        lastReportedPercentRef.current = currentPercent;
        onProgressChange?.(journeyProgress);
      }

      const video = videoRefs.current[activeIdx];
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
        return;
      }

      // Skip scrubbing if King Audio is actively playing normally
      if (activeIdx === 3 && audioEnabled && !video.paused) {
        return;
      }

      // Deterministic, Frame-Accurate Mapping
      const fps = CHAPTERS[activeIdx].fps || 24;
      const duration = video.duration;
      const totalFrames = Math.max(1, Math.floor(duration * fps));
      const targetFrame = Math.min(
        totalFrames - 1,
        Math.round(localProgress * (totalFrames - 1))
      );
      // Validated duration boundary clamp (never exceeds valid duration)
      const targetTime = Math.min(
        Math.max(0, targetFrame / fps),
        Math.max(0, duration - 0.001)
      );

      // Issue seek if target frame changed
      if (lastTargetFrameRef.current[activeIdx] !== targetFrame) {
        performSeek(activeIdx, targetTime, targetFrame);
      }

      // Debug telemetry update
      if (debugMode) {
        setDebugStats({
          rAFHz: perfRef.current.currentRafHz,
          mediaTime: video.currentTime,
          targetTime,
          targetFrame,
          totalFrames,
          progress: localProgress,
          journeyProgress,
        });
      }
    });
  }, [audioEnabled, containerRef, debugMode, onActiveChapterChange, onProgressChange, performSeek]);

  // Video metadata and canplay listeners to calculate timeline immediately
  useEffect(() => {
    const videos = videoRefs.current;
    const cleanups = [];

    videos.forEach((video) => {
      if (!video) return;

      const onMeta = () => updateTimeline();
      video.addEventListener("loadedmetadata", onMeta);
      video.addEventListener("loadeddata", onMeta);
      video.addEventListener("canplay", onMeta);

      cleanups.push(() => {
        video.removeEventListener("loadedmetadata", onMeta);
        video.removeEventListener("loadeddata", onMeta);
        video.removeEventListener("canplay", onMeta);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [updateTimeline]);

  // Window scroll and resize event registration
  useEffect(() => {
    const onScroll = () => updateTimeline();
    const onResize = () => updateTimeline();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // Keyboard shortcut 'D' to toggle diagnostic HUD
    const onKeyDown = (e) => {
      if (e.key === "d" || e.key === "D") {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          setDebugMode((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);

    // Initial calculation
    updateTimeline();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [updateTimeline]);

  const currentChapter = CHAPTERS[activeChapter] || CHAPTERS[0];

  return (
    <main
      className="journey"
      ref={containerRef}
      style={{ height: `${CHAPTERS.length * 200}vh` }}
    >
      {/* Pinned 6-Video Stage */}
      <div className="journey-stage" aria-hidden="true">
        {CHAPTERS.map((chapter, i) => (
          <video
            key={chapter.id}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            className={`journey-video ${
              activeChapter === i ? "is-active" : ""
            }`}
            src={chapter.src}
            muted
            playsInline
            preload="auto"
          />
        ))}

        {/* Subtle Vignette Gradient */}
        <div className="absolute inset-0 pointer-events-none cinematic-vignette" />
      </div>

      {/* Pinned Chapter Overlay Typography (Visible when inside the Journey) */}
      <div className={`journey-overlay ${isInsideJourney ? "is-visible" : ""}`}>
        <div className="journey-copy">
          {activeChapter === 5 && isCubWalking ? (
            <>
              <p className="journey-number">
                CHAPTER 06 · THE NEW KING
              </p>
              <h2 className="gold-text-gradient">A NEW KING RISES.</h2>
              <p className="journey-subtitle">
                "From the footsteps of the fallen, a young cub walks forward into dawn."
              </p>
              <p className="journey-story hidden sm:block">
                The sovereign rests, but the savanna never sleeps. A new life begins, ready to claim the crown.
              </p>
            </>
          ) : (
            <>
              <p className="journey-number">
                {currentChapter.tag}
              </p>
              <h2 className="gold-text-gradient">{currentChapter.title}</h2>
              <p className="journey-subtitle">{currentChapter.subtitle}</p>
              <p className="journey-story hidden sm:block">{currentChapter.story}</p>
            </>
          )}

          {/* Chapter 04: The King - Original Lion Roar Audio Trigger */}
          {activeChapter === 3 && (
            <button
              type="button"
              className={`king-audio-button ${audioEnabled ? "is-playing" : ""}`}
              onClick={playKingAudio}
              aria-pressed={audioEnabled}
            >
              {audioEnabled
                ? "🔊 KING AUDIO PLAYING (CLICK TO PAUSE)"
                : "PLAY KING VIDEO WITH ORIGINAL SOUND 🔊"}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Anchor Markers for Navbar and TimelineIndicator Smooth Jumps */}
      {CHAPTERS.map((chapter, i) => (
        <div
          key={chapter.id}
          id={`chapter-${chapter.id}`}
          style={{
            position: "absolute",
            top: `${(i / CHAPTERS.length) * 100}%`,
            width: "1px",
            height: "1px",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Diagnostic Debug HUD (Toggled via 'D' key or ?debug=true) */}
      {debugMode && (
        <aside
          className="fixed bottom-6 left-6 z-50 p-4 rounded-xl bg-black/85 backdrop-blur-md border border-[#D4AF37]/50 text-white font-mono text-xs select-none shadow-2xl pointer-events-auto"
          aria-label="Diagnostic Debug Overlay"
        >
          <div className="flex items-center justify-between gap-4 mb-2 border-b border-white/20 pb-1.5">
            <span className="text-[#D4AF37] font-bold">TIMELINE DIAGNOSTICS</span>
            <span className="text-white/50 text-[10px]">Press 'D' to hide</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-white/60">rAF Render Rate:</span>
            <span className="text-green-400 font-bold">{debugStats.rAFHz} Hz</span>

            <span className="text-white/60">Active Chapter:</span>
            <span className="text-[#E7C76A]">{currentChapter.id} · {currentChapter.title.slice(0, 16)}...</span>

            <span className="text-white/60">Journey Progress:</span>
            <span>{(debugStats.journeyProgress * 100).toFixed(1)}%</span>

            <span className="text-white/60">Chapter Progress:</span>
            <span>{(debugStats.progress * 100).toFixed(1)}%</span>

            <span className="text-white/60">Target Frame:</span>
            <span>{debugStats.targetFrame} / {debugStats.totalFrames}</span>

            <span className="text-white/60">Target Time:</span>
            <span>{debugStats.targetTime.toFixed(3)}s</span>

            <span className="text-white/60">Media Time:</span>
            <span>{debugStats.mediaTime.toFixed(3)}s</span>

            <span className="text-white/60">Encoding:</span>
            <span className="text-blue-300">All-I-Frame (Lossless Seek)</span>
          </div>
        </aside>
      )}
    </main>
  );
}
