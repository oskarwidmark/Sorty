import { Typography, Stack } from '@mui/material';
import { TitledSelect } from './components/TitledSelect';
import { TitledSlider } from './components/TitledSlider';
import { NonCustomOscillatorType } from 'tone/build/esm/source/oscillator/OscillatorInterface';
import { LabeledCheckbox } from './components/LabeledCheckbox';
import { SoundSettings } from './types';

const SOUND_TYPE_OPTIONS = [
  'sine',
  'square',
  'triangle',
  'sawtooth',
] as NonCustomOscillatorType[];

interface SoundTabProps {
  settings: SoundSettings;
  setSettings: (settings: Partial<SoundSettings>) => void;
  setSoundType: (type: NonCustomOscillatorType) => void;
  setVolume: (volume: number) => void;
}

export const SoundTab = ({
  settings: {
    soundType,
    soundVolume,
    frequencyRange,
    playSoundOnComparison,
    playSoundOnSwap,
    playSoundOnAuxWrite,
  },
  setSettings,
  setSoundType,
  setVolume,
}: SoundTabProps) => (
  <>
    <TitledSelect
      title="Sound type"
      value={soundType}
      onSelect={(value) => setSoundType(value as NonCustomOscillatorType)}
      options={SOUND_TYPE_OPTIONS}
    />
    <TitledSlider
      title="Volume"
      defaultValue={soundVolume}
      valueLabelDisplay="auto"
      min={0}
      step={1}
      max={100}
      onChangeCommitted={(_, value) => setVolume(value as number)}
      valueLabelFormat={(value: number) => `${value}%`}
    />
    <TitledSlider
      title="Frequency"
      defaultValue={frequencyRange}
      valueLabelDisplay="auto"
      min={40}
      step={10}
      max={2000}
      onChangeCommitted={(_, value) =>
        setSettings({ frequencyRange: value as [number, number] })
      }
      disableSwap
      valueLabelFormat={(value: number) => `${value} Hz`}
    />
    <div>
      <Typography align="left" variant="subtitle1" color="textSecondary">
        Play sound on
      </Typography>
      <Stack>
        <LabeledCheckbox
          label="Comparison"
          checked={playSoundOnComparison}
          onChecked={(checked) =>
            setSettings({ playSoundOnComparison: checked })
          }
        />
        <LabeledCheckbox
          label="Swap"
          checked={playSoundOnSwap}
          onChecked={(checked) => setSettings({ playSoundOnSwap: checked })}
        />
        <LabeledCheckbox
          label="Aux. write"
          checked={playSoundOnAuxWrite}
          onChecked={(checked) => setSettings({ playSoundOnAuxWrite: checked })}
        />
      </Stack>
    </div>
  </>
);
