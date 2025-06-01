import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AppWithSound } from './AppWithSound.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithSound />
  </StrictMode>,
);
