import {
  Drawer,
  IconButton,
  FormControl,
  Typography,
  Select,
  MenuItem,
  Slider,
  SelectChangeEvent,
  TextField,
  Grid2,
  Stack,
} from '@mui/material';
import { SortName, ResetPreset, AlgorithmOptions, ColorPreset } from './types';
import { inverseTimeScale, timeScale } from './utils';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { POWERS_OF_TWO } from './constants';
import { useEffect } from 'react';
import { Options } from './Options';

interface SideDrawerProps {
  areSettingsOpen: boolean;
  toggleDisplaySettings: () => void;
  chosenSortAlg: SortName;
  chooseSortAlg: (event: SelectChangeEvent<SortName>) => void;
  changeColumnNbr: (_: unknown, value: number | number[]) => void;
  changeSwapTime: (_: unknown, value: number | number[]) => void;
  changeCompareTime: (_: unknown, value: number | number[]) => void;
  resetPreset: ResetPreset;
  chooseResetPreset: (event: SelectChangeEvent<ResetPreset>) => void;
  columnNbr: number;
  swapTime: number;
  compareTime: number;
  algorithmOptions: AlgorithmOptions;
  setAlgorithmOption: (
    key: keyof AlgorithmOptions,
    value: AlgorithmOptions[typeof key],
  ) => void;
  colorPreset: ColorPreset;
  columnColor: string;
  backgroundColor: string;
  highlightColor: string;
  setColorPreset: (string: ColorPreset) => void;
  setColumnColor: (string: string) => void;
  setBackgroundColor: (string: string) => void;
  setHighlightColor: (string: string) => void;
}

export function SideDrawer({
  chosenSortAlg,
  changeColumnNbr,
  columnNbr,
  swapTime,
  compareTime,
  toggleDisplaySettings,
  changeSwapTime,
  changeCompareTime,
  chooseSortAlg,
  resetPreset,
  chooseResetPreset,
  areSettingsOpen,
  algorithmOptions,
  setAlgorithmOption,
  colorPreset,
  columnColor,
  backgroundColor,
  highlightColor,
  setColorPreset,
  setColumnColor,
  setBackgroundColor,
  setHighlightColor,
}: SideDrawerProps) {
  // Bitonic Sort and recursive Odd-even mergesort requires a power of two
  const requiresPowerOfTwoColumns =
    chosenSortAlg === SortName.BitonicSort ||
    (chosenSortAlg === SortName.OddEvenMergesort &&
      algorithmOptions.type === 'recursive');

  useEffect(() => {
    if (requiresPowerOfTwoColumns) {
      changeColumnNbr(undefined, 2 ** Math.floor(Math.log2(columnNbr)));
    }
  }, [requiresPowerOfTwoColumns, changeColumnNbr, columnNbr]);

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      className="drawer"
      open={areSettingsOpen}
      PaperProps={{
        sx: { width: '20%' },
      }}
    >
      <div className="chevron-wrapper">
        <IconButton onClick={toggleDisplaySettings}>
          <ChevronRightIcon />
        </IconButton>
      </div>
      <div className="select-wrapper">
        <FormControl component="fieldset">
          <Typography
            align="left"
            variant="h6"
            color="textSecondary"
            gutterBottom
          >
            Sorting Algorithm
          </Typography>
          <Select value={chosenSortAlg} onChange={chooseSortAlg} size="small">
            {Object.values(SortName).map((v) => (
              <MenuItem value={v} key={v}>
                <Typography align="left" variant="body1" color="textSecondary">
                  {v}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <Options
        chosenSortAlg={chosenSortAlg}
        algorithmOptions={algorithmOptions}
        setAlgorithmOption={setAlgorithmOption}
      />
      <div>
        <Typography
          align="left"
          variant="h6"
          color="textSecondary"
          gutterBottom
        >
          # Columns
        </Typography>
        <div className="col-slider">
          <Slider
            defaultValue={columnNbr}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            min={8}
            max={1024}
            step={requiresPowerOfTwoColumns ? null : 1}
            marks={
              requiresPowerOfTwoColumns
                ? POWERS_OF_TWO.map((value) => ({
                    value,
                  }))
                : false
            }
            onChangeCommitted={changeColumnNbr}
          />
        </div>
      </div>
      <div>
        <Typography
          align="left"
          variant="h6"
          color="textSecondary"
          gutterBottom
        >
          Time per swap (ms)
        </Typography>
        <div className="col-slider">
          <Slider
            defaultValue={inverseTimeScale(swapTime)}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            min={0}
            step={0.1}
            max={10}
            scale={(x) => timeScale(x)}
            onChangeCommitted={changeSwapTime}
          />
        </div>
      </div>
      <div>
        <Typography
          align="left"
          variant="h6"
          color="textSecondary"
          gutterBottom
        >
          Time per comparison (ms)
        </Typography>
        <div className="col-slider">
          <Slider
            defaultValue={inverseTimeScale(compareTime)}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            min={0}
            step={0.1}
            max={10}
            scale={(x) => timeScale(x)}
            onChangeCommitted={changeCompareTime}
          />
        </div>
      </div>
      <div className="select-wrapper">
        <FormControl component="fieldset">
          <Typography
            align="left"
            variant="h6"
            color="textSecondary"
            gutterBottom
          >
            Reset Preset
          </Typography>
          <Select
            defaultValue={resetPreset}
            value={resetPreset}
            onChange={chooseResetPreset}
            size="small"
          >
            {Object.values(ResetPreset).map((v) => (
              <MenuItem value={v} key={v}>
                <Typography align="left" variant="body1" color="textSecondary">
                  {v}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div className="select-wrapper">
        <FormControl component="fieldset">
          <Typography
            align="left"
            variant="h6"
            color="textSecondary"
            gutterBottom
          >
            Colors
          </Typography>
          <Stack direction="column" spacing={2} alignItems="left">
            <TextField
              value={colorPreset}
              label="Preset"
              size="small"
              select
              onChange={(e) => setColorPreset(e.target.value as ColorPreset)}
            >
              {Object.values(ColorPreset).map((v) => (
                <MenuItem value={v} key={v}>
                  <Typography
                    align="left"
                    variant="body1"
                    color="textSecondary"
                  >
                    {v}
                  </Typography>
                </MenuItem>
              ))}
            </TextField>
            {colorPreset === ColorPreset.Custom && (
              <Grid2 container spacing={2}>
                <TextField
                  label="Columns"
                  value={columnColor}
                  type="color"
                  size="small"
                  sx={{ width: 100 }}
                  onChange={(e) => setColumnColor(e.target.value)}
                />
                <TextField
                  label="Background"
                  value={backgroundColor}
                  type="color"
                  size="small"
                  sx={{ width: 100 }}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                />
                <TextField
                  label="Highlight"
                  value={highlightColor}
                  type="color"
                  size="small"
                  sx={{ width: 100 }}
                  onChange={(e) => setHighlightColor(e.target.value)}
                />
              </Grid2>
            )}
          </Stack>
        </FormControl>
      </div>
    </Drawer>
  );
}
