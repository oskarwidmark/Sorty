import { Typography, Stack } from '@mui/material';
import { TitledSelect } from './TitledSelect';
import { TitledSlider } from './TitledSlider';
import { NonCustomOscillatorType } from 'tone/build/esm/source/oscillator/OscillatorInterface';
import { LabeledCheckbox } from './LabeledCheckbox';

const SOUND_TYPE_OPTIONS = [
  'sine',
  'square',
  'triangle',
  'sawtooth',
] as NonCustomOscillatorType[];

interface SoundTabProps {
  soundType: string;
  setSoundType: (soundType: NonCustomOscillatorType) => void;
  soundVolume: number;
  setVolume: (volume: number) => void;
  frequencyRange: [number, number];
  setFrequencyRange: (range: [number, number]) => void;
  playSoundOnComparison: boolean;
  setPlaySoundOnComparison: (value: boolean) => void;
  playSoundOnSwap: boolean;
  setPlaySoundOnSwap: (value: boolean) => void;
  playSoundOnAuxWrite: boolean;
  setPlaySoundOnAuxWrite: (value: boolean) => void;
}

export const SoundTab = ({
  soundType,
  setSoundType,
  soundVolume,
  setVolume,
  frequencyRange,
  setFrequencyRange,
  playSoundOnComparison,
  setPlaySoundOnComparison,
  playSoundOnSwap,
  setPlaySoundOnSwap,
  playSoundOnAuxWrite,
  setPlaySoundOnAuxWrite,
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
        setFrequencyRange(value as [number, number])
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
          onChecked={setPlaySoundOnComparison}
        />
        <LabeledCheckbox
          label="Swap"
          checked={playSoundOnSwap}
          onChecked={setPlaySoundOnSwap}
        />
        <LabeledCheckbox
          label="Aux. write"
          checked={playSoundOnAuxWrite}
          onChecked={setPlaySoundOnAuxWrite}
        />
      </Stack>
    </div>
  </>
);
