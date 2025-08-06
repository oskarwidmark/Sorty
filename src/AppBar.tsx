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
import { SortValue } from './types';

interface AppBarProps {
  sort: (arr: SortValue[]) => Promise<void>;
  arr: SortValue[];
  isSorting: boolean;
  shuffleAndDraw: () => void;
  resetAndDraw: () => void;
  canDraw: boolean;
  toggleCanDraw: () => void;
  swapTime: number;
  nbrOfSwaps: number;
  compareTime: number;
  nbrOfComparisons: number;
  auxWriteTime: number;
  nbrOfAuxWrites: number;
  toggleDisplaySettings: () => void;
  shouldPlaySound: boolean;
  togglePlaySound: () => void;
  onClick: () => void;
}

export function SortAppBar(props: AppBarProps) {
  return (
    <AppBar position="relative">
      <Toolbar className="toolbar" onClick={props.onClick}>
        <div>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => props.sort(props.arr)}
            disableElevation
            startIcon={!props.isSorting ? <PlayCircle /> : <StopCircle />}
          >
            Sort
          </Button>
        </div>
        <div>
          <Button
            variant="contained"
            color="secondary"
            onClick={props.shuffleAndDraw}
            disableElevation
          >
            Shuffle
          </Button>
        </div>
        <div>
          <Button
            variant="contained"
            color="secondary"
            onClick={props.resetAndDraw}
            disableElevation
          >
            Reset
          </Button>
        </div>
        <div>
          <FormControlLabel
            control={
              <Switch
                checked={props.canDraw}
                onChange={props.toggleCanDraw}
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
                checked={props.shouldPlaySound}
                onChange={props.togglePlaySound}
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
            {props.swapTime || !props.isSorting ? (
              props.nbrOfSwaps
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
            {props.compareTime || !props.isSorting ? (
              props.nbrOfComparisons
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
            {props.auxWriteTime || !props.isSorting ? (
              props.nbrOfAuxWrites
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
            props.toggleDisplaySettings();
          }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
