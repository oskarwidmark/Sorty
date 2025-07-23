import React from 'react';
import App from './App';
import { useSoundPlayer } from './useSoundPlayer';
import { NonCustomOscillatorType } from 'tone/build/esm/source/oscillator/OscillatorInterface';
import { gainToDb } from 'tone';
import { DEFAULT_SOUND_TYPE, DEFAULT_SOUND_VOLUME } from './constants';

export function AppWithSound(): React.ReactElement {
  const [soundType, setSoundType] =
    React.useState<NonCustomOscillatorType>(DEFAULT_SOUND_TYPE);

  const [volume, setVolume] = React.useState(DEFAULT_SOUND_VOLUME);

  const { play, stop } = useSoundPlayer({
    type: soundType,
    volume: gainToDb(volume / 100), // Convert volume percentage to decibels
  });

  return (
    <App
      playSound={play}
      stopSounds={stop}
      soundType={soundType}
      setSoundType={setSoundType}
      setVolume={setVolume}
    />
  );
}
