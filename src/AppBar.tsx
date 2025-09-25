import {
  BarChart,
  Brush,
  MusicNote,
  MusicOff,
  PlayCircle,
  Refresh,
  StopCircle,
} from '@mui/icons-material';
import {
  Toolbar,
  Button,
  FormControlLabel,
  Typography,
  CircularProgress,
  IconButton,
  AppBar,
  useTheme,
  useMediaQuery,
  Checkbox,
  Grid2,
  ButtonProps,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { AppState, SortSettings, SortValue } from './types';

type AppBarButtonProps = {
  isCompact: boolean;
  text: string;
  icon: React.ReactElement;
} & ButtonProps;

const AppBarButton = ({
  isCompact,
  icon,
  text,
  ...props
}: AppBarButtonProps) => (
  <Button
    variant="contained"
    color="secondary"
    disableElevation
    startIcon={!isCompact ? icon : undefined}
    {...props}
  >
    {!isCompact ? text : icon}
  </Button>
);

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
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down('md'));
  const isM = useMediaQuery(theme.breakpoints.down('lg'));

  const sortIcon = !isSorting ? <PlayCircle /> : <StopCircle />;

  return (
    <AppBar position="relative">
      <Toolbar variant="dense" className="toolbar" onClick={onClick}>
        <div>
          <AppBarButton
            isCompact={isM}
            text="Sort"
            icon={sortIcon}
            onClick={() => startSorting(arr)}
          />
        </div>
        <div>
          <AppBarButton
            isCompact={isM}
            text="Shuffle"
            icon={<BarChart />}
            onClick={shuffleAndRedraw}
          />
        </div>
        <div>
          <AppBarButton
            isCompact={isM}
            text="Reset"
            icon={<Refresh />}
            onClick={resetAndDraw}
          />
        </div>
        <Grid2
          container
          direction="row"
          sx={{ flexWrap: 'nowrap', alignItems: 'center', flexShrink: 0 }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={canDraw}
                onChange={toggleCanDraw}
                name="canDraw"
                color="secondary"
                icon={<Brush />}
                checkedIcon={<Brush />}
              />
            }
            sx={{ marginRight: isSm ? '0px' : undefined, marginLeft: '0px' }}
            label={!isSm ? 'Draw Mode' : ''}
            slotProps={{ typography: { whiteSpace: 'nowrap' } }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={shouldPlaySound}
                onChange={togglePlaySound}
                name="shouldPlaySound"
                color="secondary"
                icon={<MusicOff />}
                checkedIcon={<MusicNote />}
              />
            }
            sx={{ marginRight: isSm ? '0px' : undefined, marginLeft: '0px' }}
            label={!isSm ? 'Play Sound' : ''}
            slotProps={{ typography: { whiteSpace: 'nowrap' } }}
          />
        </Grid2>
        <div>
          <Typography className="counter" align="left" color="white" noWrap>
            {!isM ? 'Swaps:' : 'S:'}{' '}
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
          <Typography className="counter" align="left" color="white" noWrap>
            {!isM ? 'Comparisons:' : 'C:'}{' '}
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
          <Typography className="counter" align="left" color="white" noWrap>
            {!isM ? 'Aux. writes:' : 'AW:'}{' '}
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
