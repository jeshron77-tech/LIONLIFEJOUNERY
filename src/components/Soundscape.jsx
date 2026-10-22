import { useEffect, useRef } from 'react';

/**
 * Procedural African Savanna Soundscape using Web Audio API
 * Generates warm savanna wind, resonant ground drones, and atmospheric warmth
 * Zero external audio files required, zero broken asset risk.
 */
export function useSoundscape(isPlaying, isDucked = false) {
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const noiseSourceRef = useRef(null);
  const droneOscRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) {
      if (masterGainRef.current && audioCtxRef.current) {
        // Fade out
        masterGainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.4);
      }
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (!masterGainRef.current) {
        masterGainRef.current = ctx.createGain();
        masterGainRef.current.gain.setValueAtTime(0, ctx.currentTime);
        masterGainRef.current.connect(ctx.destination);

        // 1. Warm Savanna Wind Noise Generator
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02; // Pink-ish noise filter
          lastOut = output[i];
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Bandpass filter for wind howl in savanna grass
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);
        filter.Q.setValueAtTime(2.5, ctx.currentTime);

        const windGain = ctx.createGain();
        windGain.gain.setValueAtTime(0.08, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(windGain);
        windGain.connect(masterGainRef.current);
        whiteNoise.start();
        noiseSourceRef.current = whiteNoise;

        // 2. Deep Sub-Harmonic Ground Drone (55Hz and 110Hz warm roots)
        const drone = ctx.createOscillator();
        drone.type = 'sine';
        drone.frequency.setValueAtTime(55, ctx.currentTime); // A1 note

        const droneFilter = ctx.createBiquadFilter();
        droneFilter.type = 'lowpass';
        droneFilter.frequency.setValueAtTime(120, ctx.currentTime);

        const droneGain = ctx.createGain();
        droneGain.gain.setValueAtTime(0.05, ctx.currentTime);

        drone.connect(droneFilter);
        droneFilter.connect(droneGain);
        droneGain.connect(masterGainRef.current);
        drone.start();
        droneOscRef.current = drone;
      }

      // Smooth fade in (duck during King's roar so movie audio takes full focus!)
      const targetVolume = isDucked ? 0.02 : 0.2;
      masterGainRef.current.gain.setTargetAtTime(targetVolume, ctx.currentTime, 0.5);
    } catch (err) {
      console.warn("Web Audio ambient error:", err);
    }

    return () => {
      // Do not destroy audio context immediately on render, only fade
    };
  }, [isPlaying, isDucked]);

  return null;
}
