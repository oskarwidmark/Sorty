import { Stack } from '@mui/material';
import { ColumnSlider } from './ColumnSlider';
import { Options } from './Options';
import { TimeSlider } from './components/TimeSlider';
import { TitledSelect } from './components/TitledSelect';
import { SortName, ResetPreset, SortSettings, AlgorithmOptions } from './types';

interface SortTabProps {
  settings: SortSettings;
  chooseSortAlg: (name: SortName) => void;
  changeColumnNbr: (nbr: number) => void;
  setAlgorithmOption: (
    key: keyof AlgorithmOptions,
    value: AlgorithmOptions[typeof key],
  ) => void;
  setSettings: (settings: Partial<SortSettings>) => void;
}

export const SortTab = ({
  settings: {
    chosenSortAlg,
    algorithmOptions,
    columnNbr,
    swapTime,
    compareTime,
    auxWriteTime,
    resetPreset,
  },
  chooseSortAlg,
  changeColumnNbr,
  setAlgorithmOption,
  setSettings,
}: SortTabProps) => {
  return (
    <>
      <TitledSelect
        title="Sorting Algorithm"
        value={chosenSortAlg}
        onSelect={(value) => chooseSortAlg(value as SortName)}
        options={Object.values(SortName)}
      />
      <Options
        chosenSortAlg={chosenSortAlg}
        algorithmOptions={algorithmOptions}
        setAlgorithmOption={setAlgorithmOption}
      />
      <ColumnSlider
        columnNbr={columnNbr}
        chosenSortAlg={chosenSortAlg}
        algorithmOptions={algorithmOptions}
        changeColumnNbr={(_, nbr) => changeColumnNbr(nbr as number)}
      />
      <Stack>
        <TimeSlider
          title="Time per swap"
          time={swapTime}
          changeTime={(swapTime) => setSettings({ swapTime })}
        />
        <TimeSlider
          title="Time per comparison"
          time={compareTime}
          changeTime={(compareTime) => setSettings({ compareTime })}
        />
        <TimeSlider
          title="Time per aux. write"
          time={auxWriteTime}
          changeTime={(auxWriteTime) => setSettings({ auxWriteTime })}
        />
      </Stack>
      <TitledSelect
        title="Reset Preset"
        value={resetPreset}
        onSelect={(value) => {
          setSettings({
            resetPreset: value as ResetPreset,
          });
        }}
        options={Object.values(ResetPreset)}
      />
    </>
  );
};
