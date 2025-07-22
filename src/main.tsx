import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AppWithSound } from './AppWithSound.tsx';
import { createTheme, ThemeOptions, ThemeProvider } from '@mui/material/styles';

export const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#009688',
    },
    secondary: {
      main: '#009688',
    },
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={createTheme(themeOptions)}>
      <AppWithSound />
    </ThemeProvider>
  </StrictMode>,
);
