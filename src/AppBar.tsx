import { PlayCircle, StopCircle } from '@mui/icons-material';
import {
  Toolbar,
  Button,
  FormControlLabel,
  Switch,
  Typography,
  CircularProgress,
  IconButton,
  AppBar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { AppState, SortSettings, SortValue } from './types';

interface AppBarProps {
  startSorting: (arr: SortValue[]) => Promise<void>;
  arr: SortValue[];
  shuffleAndRedraw: () => void;
  resetAndDraw: () => void;
  toggleCanDraw: () => void;
  toggleDisplaySettings: () => void;
  togglePlaySound: () => void;
  onClick: () => void;
  state: Omit<AppState, 'settings'>;
  settings: SortSettings;
}

export function SortAppBar({
  startSorting,
  arr,
  shuffleAndRedraw,
  resetAndDraw,
  toggleCanDraw,
  toggleDisplaySettings,
  togglePlaySound,
  onClick,
  settings: { swapTime, compareTime, auxWriteTime },
  state: {
    isSorting,
    canDraw,
    nbrOfSwaps,
    nbrOfComparisons,
    nbrOfAuxWrites,
    shouldPlaySound,
  },
}: AppBarProps) {
  return (
    <AppBar position="relative">
      <Toolbar className="toolbar" onClick={onClick}>
        <div>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => startSorting(arr)}
            disableElevation
            startIcon={!isSorting ? <PlayCircle /> : <StopCircle />}
          >
            Sort
          </Button>
        </div>
        <div>
          <Button
            variant="contained"
            color="secondary"
            onClick={shuffleAndRedraw}
            disableElevation
          >
            Shuffle
          </Button>
        </div>
        <div>
          <Button
            variant="contained"
            color="secondary"
            onClick={resetAndDraw}
            disableElevation
          >
            Reset
          </Button>
        </div>
        <div>
          <FormControlLabel
            control={
              <Switch
                checked={canDraw}
                onChange={toggleCanDraw}
                name="canDraw"
                color="secondary"
              />
            }
            sx={{ marginRight: '0px' }}
            label="Draw Mode"
          />
        </div>
        <div>
          <FormControlLabel
            control={
              <Switch
                checked={shouldPlaySound}
                onChange={togglePlaySound}
                name="shouldPlaySound"
                color="secondary"
              />
            }
            label="Play Sound"
          />
        </div>
        <div>
          <Typography className="counter" align="left" color="white">
            Swaps:{' '}
            {swapTime || !isSorting ? (
              nbrOfSwaps
            ) : (
              <CircularProgress
                className="counter-spinner"
                size={15}
                thickness={10}
                color="secondary"
              />
            )}
          </Typography>
        </div>
        <div>
          <Typography className="counter" align="left" color="white">
            Comparisons:{' '}
            {compareTime || !isSorting ? (
              nbrOfComparisons
            ) : (
              <CircularProgress
                className="counter-spinner"
                size={15}
                thickness={10}
                color="secondary"
              />
            )}
          </Typography>
        </div>
        <div>
          <Typography className="counter" align="left" color="white">
            Aux. writes:{' '}
            {auxWriteTime || !isSorting ? (
              nbrOfAuxWrites
            ) : (
              <CircularProgress
                className="counter-spinner"
                size={15}
                thickness={10}
                color="secondary"
              />
            )}
          </Typography>
        </div>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="end"
          className="open-drawer-button"
          onClick={(e) => {
            e.stopPropagation();
            toggleDisplaySettings();
          }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
