import {
  FormControl,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Grid2,
} from '@mui/material';
import { ColorPreset } from './types';

export function Colors(props: {
  colorPreset: ColorPreset;
  setColorPreset: (string: ColorPreset) => void;
  columnColor: string;
  setColumnColor: (string: string) => void;
  backgroundColor: string;
  setBackgroundColor: (string: string) => void;
  highlightColor: string;
  setHighlightColor: (string: string) => void;
}) {
  const {
    colorPreset,
    setColorPreset,
    columnColor,
    setColumnColor,
    backgroundColor,
    setBackgroundColor,
    highlightColor,
    setHighlightColor,
  } = props;

  return (
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
                <Typography align="left" variant="body1" color="textSecondary">
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
  );
}
