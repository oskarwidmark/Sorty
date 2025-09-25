import { useMediaQuery, useTheme } from '@mui/material';

export const useIsPortrait = () => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
};
