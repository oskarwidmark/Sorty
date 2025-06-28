import {
  SelectChangeEvent,
  FormControl,
  Typography,
  Select,
  MenuItem,
} from '@mui/material';
import { ResetPreset } from './types';

export function ResetPresetSelect(props: {
  resetPreset: ResetPreset;
  chooseResetPreset: (event: SelectChangeEvent<ResetPreset>) => void;
}) {
  const { resetPreset, chooseResetPreset } = props;
  return (
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
  );
}
