import { FormControl, Stack, Grid2 } from '@mui/material';
import { ColorPreset } from './types';
import { TitledSelect } from './TitledSelect';
import { ColorField } from './ColorField';

export function ColorTab(props: {
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
    <FormControl component="fieldset">
      <Stack direction="column" spacing={2} alignItems="left">
        <TitledSelect
          title="Preset"
          value={colorPreset}
          onSelect={(value) => setColorPreset(value as ColorPreset)}
          options={Object.values(ColorPreset)}
        />
        {(colorPreset === ColorPreset.Custom ||
          colorPreset === ColorPreset.CustomGradient) && (
          <Grid2 container spacing={2}>
            <ColorField
              label={
                colorPreset === ColorPreset.Custom ? 'Columns' : 'Columns(1)'
              }
              color={columnColor1}
              setColor={setColumnColor1}
            />
            {colorPreset === ColorPreset.CustomGradient && (
              <ColorField
                label="Columns(2)"
                color={columnColor2}
                setColor={setColumnColor2}
              />
            )}
            <ColorField
              label="Background"
              color={backgroundColor}
              setColor={setBackgroundColor}
            />
            <ColorField
              label="Highlight"
              color={highlightColor}
              setColor={setHighlightColor}
            />
          </Grid2>
        )}
      </Stack>
    </FormControl>
  );
}
