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
import { SortName, ResetPreset } from './types';
import { timeScale } from './utils';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  INIT_COLUMN_NUMBER,
  INIT_SWAP_TIME,
  INIT_COMPARE_TIME,
} from './constants';

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
}

export function SideDrawer(props: SideDrawerProps) {
  return (
    <Drawer
      variant="persistent"
      anchor="right"
      className="drawer"
      open={props.areSettingsOpen}
      PaperProps={{
        sx: { width: '20%' },
      }}
    >
      <div className="chevron-wrapper">
        <IconButton onClick={props.toggleDisplaySettings}>
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
          <Select
            value={props.chosenSortAlg}
            onChange={props.chooseSortAlg}
            size="small"
          >
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
            min={10}
            max={1000}
            onChangeCommitted={props.changeColumnNbr}
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
            onChangeCommitted={props.changeSwapTime}
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
            onChangeCommitted={props.changeCompareTime}
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
            value={props.resetPreset}
            onChange={props.chooseResetPreset}
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
    </Drawer>
  );
}
