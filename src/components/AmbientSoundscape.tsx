"use client";

import React, { useEffect, useRef } from "react";
import { useVaultStore } from "@/store/useVaultStore";

export function AmbientSoundscape() {
  const soundscape = useVaultStore((s) => s.soundscape);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (soundscape === "off") {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (sourceRef.current) {
        try {
          (sourceRef.current as any).stop?.();
          sourceRef.current.disconnect();
        } catch {}
      }

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Create pink/brown noise based on soundscape
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (soundscape === "rain") {
          output[i] = (output[i - 1] || 0) * 0.95 + white * 0.05; // Pinkish rain
        } else if (soundscape === "fireplace") {
          const crackle = Math.random() > 0.999 ? (Math.random() * 2 - 1) * 3 : 0;
          output[i] = (output[i - 1] || 0) * 0.98 + white * 0.02 + crackle;
        } else {
          // Library hum
          output[i] = (output[i - 1] || 0) * 0.99 + white * 0.01;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.04; // Very gentle volume

      // Filter to soften the frequency
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = soundscape === "rain" ? 800 : 400;

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      whiteNoise.start(0);
      sourceRef.current = whiteNoise;
      gainRef.current = gainNode;
    } catch (e) {
      console.warn("Audio Context init warning:", e);
    }

    return () => {
      if (sourceRef.current) {
        try {
          (sourceRef.current as any).stop?.();
          sourceRef.current.disconnect();
        } catch {}
      }
    };
  }, [soundscape]);

  return null;
}
