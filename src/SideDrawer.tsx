import {
  Drawer,
  IconButton,
  FormControl,
  Typography,
  Select,
  MenuItem,
  Slider,
  SelectChangeEvent,
} from '@mui/material';
import { SortName, ResetPreset, AlgorithmOptions } from './types';
import { timeScale } from './utils';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  INIT_COLUMN_NUMBER,
  INIT_SWAP_TIME,
  INIT_COMPARE_TIME,
  POWERS_OF_TWO,
} from './constants';
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
  algorithmOptions: AlgorithmOptions;
  setAlgorithmOption: (
    key: keyof AlgorithmOptions,
    value: AlgorithmOptions[typeof key],
  ) => void;
}

export function SideDrawer({
  chosenSortAlg,
  changeColumnNbr,
  columnNbr,
  toggleDisplaySettings,
  changeSwapTime,
  changeCompareTime,
  chooseSortAlg,
  resetPreset,
  chooseResetPreset,
  areSettingsOpen,
  algorithmOptions,
  setAlgorithmOption,
}: SideDrawerProps) {
  const isBitonicSort = chosenSortAlg === SortName.BitonicSort;

  useEffect(() => {
    // Bitonic Sort requires a power of two
    if (isBitonicSort) {
      changeColumnNbr(undefined, 2 ** Math.floor(Math.log2(columnNbr)));
    }
  }, [isBitonicSort, changeColumnNbr, columnNbr]);

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
            defaultValue={INIT_COLUMN_NUMBER}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            min={8}
            max={1024}
            step={isBitonicSort ? null : 1}
            marks={
              isBitonicSort
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
            defaultValue={INIT_SWAP_TIME}
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
            defaultValue={INIT_COMPARE_TIME}
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
          <Select value={resetPreset} onChange={chooseResetPreset} size="small">
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
    </Drawer>
  );
}
