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
  columnColor1: string;
  setColumnColor1: (string: string) => void;
  columnColor2: string;
  setColumnColor2: (string: string) => void;
  backgroundColor: string;
  setBackgroundColor: (string: string) => void;
  highlightColor: string;
  setHighlightColor: (string: string) => void;
}) {
  const {
    colorPreset,
    setColorPreset,
    columnColor1,
    setColumnColor1,
    columnColor2,
    setColumnColor2,
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
          variant="subtitle1"
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
                <Typography align="left" variant="body2" color="textSecondary">
                  {v}
                </Typography>
              </MenuItem>
            ))}
          </TextField>
          {(colorPreset === ColorPreset.Custom ||
            colorPreset === ColorPreset.CustomGradient) && (
            <Grid2 container spacing={2}>
              <TextField
                label={
                  colorPreset === ColorPreset.Custom ? 'Columns' : 'Columns(1)'
                }
                value={columnColor1}
                type="color"
                size="small"
                sx={{ width: 100 }}
                onChange={(e) => setColumnColor1(e.target.value)}
              />
              {colorPreset === ColorPreset.CustomGradient && (
                <TextField
                  label="Columns(2)"
                  value={columnColor2}
                  type="color"
                  size="small"
                  sx={{ width: 100 }}
                  onChange={(e) => setColumnColor2(e.target.value)}
                />
              )}
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
