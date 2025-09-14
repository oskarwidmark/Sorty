import { FormControl, Stack, Grid2 } from '@mui/material';
import { ColorPreset, ColorSettings } from './types';
import { TitledSelect } from './components/TitledSelect';
import { ColorField } from './components/ColorField';

export function ColorTab(props: {
  settings: ColorSettings;
  setColorSettings: (settings: Partial<ColorSettings>) => void;
}) {
  const {
    settings: {
      colorPreset,
      columnColor1,
      columnColor2,
      highlightColor,
      backgroundColor,
    },
    setColorSettings,
  } = props;

  return (
    <FormControl component="fieldset">
      <Stack direction="column" spacing={2} alignItems="left">
        <TitledSelect
          title="Preset"
          value={colorPreset}
          onSelect={(value) =>
            setColorSettings({ colorPreset: value as ColorPreset })
          }
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
              setColor={(value) => setColorSettings({ columnColor1: value })}
            />
            {colorPreset === ColorPreset.CustomGradient && (
              <ColorField
                label="Columns(2)"
                color={columnColor2}
                setColor={(value) => setColorSettings({ columnColor2: value })}
              />
            )}
            <ColorField
              label="Background"
              color={backgroundColor}
              setColor={(value) => setColorSettings({ backgroundColor: value })}
            />
            <ColorField
              label="Highlight"
              color={highlightColor}
              setColor={(value) => setColorSettings({ highlightColor: value })}
            />
          </Grid2>
        )}
      </Stack>
    </FormControl>
  );
}
