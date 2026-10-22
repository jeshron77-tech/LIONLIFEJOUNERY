import React, { useRef, useState, useCallback, useEffect } from 'react';
import { CHAPTERS } from './data/chapters';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import ScrollVideoJourney from './components/ScrollVideoJourney';
import { TimelineIndicator } from './components/TimelineIndicator';
import { EndingSection } from './components/EndingSection';
import { useSoundscape } from './components/Soundscape';

export default function App() {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const storyContainerRef = useRef(null);

  // Procedural Web Audio Ambient Soundscape (ducks volume during Chapter 4 King Roar)
  useSoundscape(isAudioPlaying, activeChapterIndex === 3);

  // Jump smoothly to a specific chapter
  const handleJumpToChapter = useCallback((index) => {
    const chapter = CHAPTERS[index];
    if (!chapter) return;
    const el = document.getElementById(`chapter-${chapter.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Begin scroll from Hero down into Chapter 1
  const handleBeginScroll = useCallback(() => {
    const el = document.getElementById(`chapter-${CHAPTERS[0].id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Return smoothly back to the top of Hero
  const handleReturnToBeginning = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  // Keyboard navigation for cinematic control
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Home') {
        handleReturnToBeginning();
      } else if (e.key === 'End') {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleReturnToBeginning]);

  return (
    <div className="relative w-full bg-[#080806] text-[#F5F0E6] min-h-screen">
      {/* Subtle Cinematic Film Grain Overlay */}
      <div className="film-grain" />

      {/* Floating Header Navigation */}
      <Navbar
        activeChapterIndex={activeChapterIndex}
        chapters={CHAPTERS}
        scrollProgress={globalProgress}
        isAudioPlaying={isAudioPlaying}
        toggleAudio={() => setIsAudioPlaying(prev => !prev)}
        onJumpToChapter={handleJumpToChapter}
      />

      {/* Lateral Pinned Timeline Navigator */}
      <TimelineIndicator
        chapters={CHAPTERS}
        activeChapterIndex={activeChapterIndex}
        onSelectChapter={handleJumpToChapter}
        globalProgress={globalProgress}
      />

      {/* 1. Full-Screen Hero Section */}
      <Hero onBeginScroll={handleBeginScroll} />

      {/* 2. Main Feature: 6-Chapter Timeline Scroll Video Journey */}
      <ScrollVideoJourney
        containerRef={storyContainerRef}
        onActiveChapterChange={setActiveChapterIndex}
        onProgressChange={setGlobalProgress}
      />

      {/* 3. Final Cinematic Ending */}
      <EndingSection onReturnToBeginning={handleReturnToBeginning} />
    </div>
  );
}
