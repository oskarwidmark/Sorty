import {
  BarChart,
  Edit,
  EditOff,
  PlayCircle,
  Refresh,
  StopCircle,
  VolumeOff,
  VolumeUp,
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

const formatNumber = (n: number) => {
  if (n > 10000) {
    return (n / 1000).toFixed(0) + 'k';
  }
  if (n > 1000) {
    return (n / 1000).toFixed(1) + 'k';
  }
  return n;
};

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
        <Grid2
          container
          spacing={isM ? 1 : 2}
          sx={{ flexWrap: 'nowrap', flexShrink: 0 }}
        >
          <AppBarButton
            isCompact={isM}
            text="Sort"
            icon={sortIcon}
            onClick={() => startSorting(arr)}
          />
          <AppBarButton
            isCompact={isM}
            text="Shuffle"
            icon={<BarChart />}
            onClick={shuffleAndRedraw}
          />
          <AppBarButton
            isCompact={isM}
            text="Reset"
            icon={<Refresh />}
            onClick={resetAndDraw}
          />
        </Grid2>
        <Grid2
          container
          direction="row"
          spacing={isSm ? 0 : 1}
          sx={{ flexWrap: 'nowrap', alignItems: 'center', flexShrink: 0 }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={canDraw}
                onChange={toggleCanDraw}
                name="canDraw"
                color="secondary"
                icon={<EditOff />}
                checkedIcon={<Edit />}
              />
            }
            sx={{ marginRight: '0px', marginLeft: '0px' }}
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
                icon={<VolumeOff />}
                checkedIcon={<VolumeUp />}
              />
            }
            sx={{ marginRight: '0px', marginLeft: '0px' }}
            label={!isSm ? 'Play Sound' : ''}
            slotProps={{ typography: { whiteSpace: 'nowrap' } }}
          />
        </Grid2>
        <Grid2
          container
          direction="row"
          spacing={isM ? 1 : 2}
          sx={{ flexWrap: 'nowrap' }}
        >
          <Typography className="counter" align="left" noWrap>
            {!isSm ? 'Swaps:' : 'S:'}{' '}
            {swapTime || !isSorting ? (
              isM ? (
                formatNumber(nbrOfSwaps)
              ) : (
                nbrOfSwaps
              )
            ) : (
              <CircularProgress
                className="counter-spinner"
                size={15}
                thickness={10}
                color="secondary"
              />
            )}
          </Typography>
          <Typography className="counter" align="left" noWrap>
            {!isM ? 'Comparisons:' : !isSm ? 'Comp:' : 'C:'}{' '}
            {compareTime || !isSorting ? (
              isM ? (
                formatNumber(nbrOfComparisons)
              ) : (
                nbrOfComparisons
              )
            ) : (
              <CircularProgress
                className="counter-spinner"
                size={15}
                thickness={10}
                color="secondary"
              />
            )}
          </Typography>
          <Typography className="counter" align="left" noWrap>
            {!isM ? 'Aux. writes:' : !isSm ? 'A. writes:' : 'AW:'}{' '}
            {auxWriteTime || !isSorting ? (
              isM ? (
                formatNumber(nbrOfAuxWrites)
              ) : (
                nbrOfAuxWrites
              )
            ) : (
              <CircularProgress
                className="counter-spinner"
                size={15}
                thickness={10}
                color="secondary"
              />
            )}
          </Typography>
        </Grid2>
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
