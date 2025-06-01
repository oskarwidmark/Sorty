import React, { useEffect } from 'react';
import App from './App';
import useSound from 'use-sound';
import triangle from './triangle.mp3';

export function AppWithSound(): React.ReactElement {
  const [playbackRate, setPlaybackRate] = React.useState(1.0);

  const [play, { stop }] = useSound(triangle, {
    playbackRate,
  });

  useEffect(() => {
    stop();
  }, [stop]);

  return (
    <App playSound={play} stopSounds={stop} setSoundPitch={setPlaybackRate} />
  );
}
