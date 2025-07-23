import { useEffect, useRef, useCallback, RefObject } from 'react';
import * as Tone from 'tone';
import { NonCustomOscillatorType } from 'tone/build/esm/source/oscillator/OscillatorInterface';

type PlayParams = {
  frequency: number;
  duration?: string;
};

export function useSoundPlayer({
  type,
  volume,
}: {
  type: NonCustomOscillatorType;
  volume: number; // Volume in decibels
}) {
  const synthRef: RefObject<Tone.Synth | null> = useRef(null);
  const startedRef = useRef(false);

  // create the Synth and connect it to the master output
  useEffect(() => {
    const synth = new Tone.Synth({
      oscillator: { type },
      envelope: { attack: 0.05, decay: 0, sustain: 1, release: 0.05 },
      volume,
    }).toDestination();

    synthRef.current = synth;
    return () => {
      synth.dispose();
    };
  }, [type, volume]);

  // ensure AudioContext is resumed once on first play
  const ensureStarted = useCallback(async () => {
    if (!startedRef.current) {
      await Tone.start();
      startedRef.current = true;
    }
  }, []);

  const play = useCallback(
    async ({ frequency }: PlayParams) => {
      await ensureStarted();
      const synth = synthRef.current;
      if (!synth) return;

      // stop any currently playing note
      synth.triggerRelease();

      // trigger new tone for 2 seconds max
      synth.triggerAttackRelease(frequency, 2);
    },
    [ensureStarted],
  );

  const stop = useCallback(() => {
    synthRef.current?.triggerRelease();
  }, []);

  return { play, stop };
}
