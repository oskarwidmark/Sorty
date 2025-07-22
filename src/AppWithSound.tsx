import React from 'react';
import App from './App';
import { useSoundPlayer } from './useSoundPlayer';

export function AppWithSound(): React.ReactElement {
  const { play, stop } = useSoundPlayer({
    type: 'triangle',
  });

  return <App playSound={play} stopSounds={stop} />;
}
