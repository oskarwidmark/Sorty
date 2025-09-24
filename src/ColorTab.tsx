import { FormControl, Stack, Grid2 } from '@mui/material';
import {
  ColorPreset,
  ColorSettings,
  DisplayType,
  VisualizationType,
} from './types';
import { TitledSelect } from './components/TitledSelect';
import { ColorField } from './components/ColorField';
import { TitledSlider } from './components/TitledSlider';
import { HIGHLIGHT_TYPES } from './constants';

export function ColorTab(props: {
  settings: ColorSettings;
  setColorSettings: (settings: Partial<ColorSettings>) => void;
}) {
  const {
    settings: {
      colorPreset,
      columnColor1,
      columnColor2,
      highlightColors,
      backgroundColor,
      visualizationType,
      displayType,
    },
    setColorSettings,
  } = props;

  return (
    <>
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
                  setColor={(value) =>
                    setColorSettings({ columnColor2: value })
                  }
                />
              )}
              <ColorField
                label="Background"
                color={backgroundColor}
                setColor={(value) =>
                  setColorSettings({ backgroundColor: value })
                }
              />
              {HIGHLIGHT_TYPES.map((type) => (
                <ColorField
                  label={`Highlight (${type[0].toUpperCase()})`}
                  color={highlightColors[type]}
                  setColor={(value) =>
                    setColorSettings({
                      highlightColors: { ...highlightColors, [type]: value },
                    })
                  }
                />
              ))}
            </Grid2>
          )}
        </Stack>
      </FormControl>
      <TitledSelect
        title="Visualization type"
        value={visualizationType}
        onSelect={(value) =>
          setColorSettings({ visualizationType: value as VisualizationType })
        }
        options={Object.values(VisualizationType)}
      />
      <TitledSelect
        title="Display type"
        value={displayType}
        onSelect={(value) =>
          setColorSettings({ displayType: value as DisplayType })
        }
        options={Object.values(DisplayType)}
      />
      <TitledSlider
        title="Gap size"
        value={props.settings.gapSize}
        min={0}
        max={10}
        step={1}
        marks
        onChange={(_, value) => setColorSettings({ gapSize: value as number })}
      />
    </>
  );
}
