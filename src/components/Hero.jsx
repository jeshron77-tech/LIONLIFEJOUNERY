import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Hero = React.memo(function Hero({ onBeginScroll }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Gentle cinematic fade-in after mount
    const timer = setTimeout(() => setIsLoaded(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Performance Optimization: Pause video when scrolled out of view to free GPU/decoders for chapter scrubbing
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.05 }
    );

    const section = video.closest('section');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-between px-6 py-10 md:py-14 overflow-hidden z-20">
      {/* Background with Ambient Video Footage & Glass Layer */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-[#080806]">
        {/* Crisp, vibrant ambient lion footage with instant poster */}
        <video
          ref={videoRef}
          src="/videos/hero-ambient.mp4"
          poster="/images/journey/01-born.jpg"
          autoPlay
          loop
          muted
          playsInline
          className={`w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05] saturate-[1.05] transition-all duration-1000 ${
            isLoaded ? 'opacity-90 scale-100' : 'opacity-0 scale-105'
          }`}
          style={{ transition: 'opacity 2s ease-out, transform 8s ease-out' }}
        />

        {/* Replaced heavy black transparent overlays with Apple-style Frosted Glass Layer */}
        <div className="absolute inset-0 backdrop-blur-[3px] bg-black/20" />
        
        {/* Soft Golden Savanna Sunbeam Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-[#D4AF37]/15 rounded-full blur-[140px] pointer-events-none" />
      </div>

      {/* Top Spacer */}
      <div className="w-full h-12" />

      {/* Central Hero Content - Pure Typography with Zero Enclosing Box */}
      <div
        className={`w-full max-w-4xl mx-auto text-center flex flex-col items-center justify-center px-4 transition-all duration-1000 transform ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Pre-title Monogram / Tag */}
        <div className="inline-flex items-center gap-3 mb-5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
          <span className="text-xs md:text-sm font-cinzel tracking-[0.3em] text-[#E7C76A] uppercase font-semibold">
            THE WILD · THE LIFE · THE LEGACY
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
        </div>

        {/* Majestic Gold Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-cinzel font-bold tracking-[0.12em] leading-tight mb-5 select-none drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
          <span className="gold-text-gradient block">THE KING'S</span>
          <span className="gold-text-gradient block">JOURNEY</span>
        </h1>

        {/* Golden Horizontal Accent Rule */}
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent my-3 shadow-[0_0_8px_#D4AF37]" />

        {/* Editorial Subtitle */}
        <p className="text-lg sm:text-2xl md:text-3xl font-cormorant italic font-normal tracking-wide text-[#F5F0E6] max-w-2xl px-4 mt-2 drop-shadow-[0_2px_16px_rgba(0,0,0,0.95)]">
          "From the first breath to the final sunset."
        </p>

        {/* Narrative Context Preview */}
        <p className="text-xs sm:text-sm font-sans-ui text-white/85 tracking-wider max-w-lg mt-4 font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          An interactive cinematic odyssey through the six sacred chapters of a lion's life. Controlled by your touch and scroll.
        </p>
      </div>

      {/* Bottom Scroll Indicator in Frosted Glass Pill */}
      <div
        className={`flex flex-col items-center justify-center transition-all duration-1000 delay-500 transform ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <button
          onClick={onBeginScroll}
          className="group flex flex-col items-center gap-2 cursor-pointer focus:outline-none transition-all duration-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]"
          aria-label="Scroll to begin experience"
        >
          <span className="text-[11px] md:text-xs font-cinzel tracking-[0.3em] text-[#E7C76A] uppercase group-hover:text-[#FFF6D6] transition-colors">
            SCROLL TO BEGIN
          </span>
          <div className="w-6 h-8 rounded-full border border-[#D4AF37]/50 flex items-start justify-center p-1 transition-colors group-hover:border-[#D4AF37]">
            <div className="w-1.5 h-2 rounded-full bg-[#D4AF37] animate-bounce shadow-[0_0_8px_#D4AF37]" />
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#D4AF37] group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </section>
  );
});
