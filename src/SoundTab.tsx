import { Typography, Stack, FormControlLabel, Checkbox } from '@mui/material';
import { SOUND_TYPE_OPTIONS } from './constants';
import { TitledSelect } from './TitledSelect';
import { TitledSlider } from './TitledSlider';
import { NonCustomOscillatorType } from 'tone/build/esm/source/oscillator/OscillatorInterface';

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
}: SoundTabProps) => (
  <>
    <TitledSelect
      title="Sound type"
      value={soundType}
      onChange={(event) =>
        setSoundType(event.target.value as NonCustomOscillatorType)
      }
      options={SOUND_TYPE_OPTIONS}
    />
    <TitledSlider
      title="Volume"
      defaultValue={soundVolume}
      aria-labelledby="discrete-slider"
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
      aria-labelledby="discrete-slider"
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
        <FormControlLabel
          control={
            <Checkbox
              checked={playSoundOnComparison}
              onChange={(e) => setPlaySoundOnComparison(!!e.target.checked)}
            />
          }
          label={
            <Typography align="left" variant="subtitle1" color="textSecondary">
              Comparison
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={playSoundOnSwap}
              onChange={(e) => setPlaySoundOnSwap(!!e.target.checked)}
            />
          }
          label={
            <Typography align="left" variant="subtitle1" color="textSecondary">
              Swap
            </Typography>
          }
        />
      </Stack>
    </div>
  </>
);
