import { RotateLeft } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

export const RotationRequest = () => (
  <Box
    className="App"
    sx={(theme) => ({
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
      height: '100vh',
      textAlign: 'center',
      p: 2,
      backgroundColor: theme.palette.background.default,
    })}
  >
    <RotateLeft color="primary" sx={{ marginRight: '4px' }} />
    <Typography color="primary">Please rotate to landscape mode.</Typography>
  </Box>
);
