import { NonCustomOscillatorType } from 'tone/build/esm/source/oscillator/OscillatorInterface';
import { AlgorithmOptions, ColorPreset, ResetPreset, SortName } from './types';

export const INIT_SWAP_TIME = 1;
export const INIT_COMPARE_TIME = 1;
export const INIT_COLUMN_NUMBER = 100;
export const POWERS_OF_TWO = [8, 16, 32, 64, 128, 256, 512, 1024];
export const DEFAULT_COLUMN_COLOR_1 = '#ffffff';
export const DEFAULT_COLUMN_COLOR_2 = '#ffffff';
export const DEFAULT_BACKGROUND_COLOR = '#000000';
export const DEFAULT_HIGHLIGHT_COLOR = '#ff0000';
export const RAINBOW_BACKGROUND_COLOR = '#282c34';
export const DEFAULT_ALGORITHM_OPTIONS: AlgorithmOptions = {
  type: 'iterative',
  base: 4,
  shrinkFactor: 1.3,
};
export const DEFAULT_SOUND_VOLUME = 50;
export const DEFAULT_SOUND_TYPE = 'triangle';
export const SOUND_TYPE_OPTIONS = [
  'sine',
  'square',
  'triangle',
  'sawtooth',
] as NonCustomOscillatorType[];

export const INIT_STATE = {
  isSorting: false,
  areSettingsOpen: false,
  shouldPlaySound: false,
  canDraw: false,
  nbrOfSwaps: 0,
  nbrOfComparisons: 0,
  tabIndex: 0,
};

export const INIT_SETTINGS = {
  columnNbr: INIT_COLUMN_NUMBER,
  chosenSortAlg: SortName.InsertionSort,
  swapTime: INIT_SWAP_TIME,
  compareTime: INIT_COMPARE_TIME,
  resetPreset: ResetPreset.Shuffle,
  algorithmOptions: DEFAULT_ALGORITHM_OPTIONS,
  colorPreset: ColorPreset.Rainbow,
  columnColor1: DEFAULT_COLUMN_COLOR_1,
  columnColor2: DEFAULT_COLUMN_COLOR_2,
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  highlightColor: DEFAULT_HIGHLIGHT_COLOR,
  soundVolume: DEFAULT_SOUND_VOLUME,
  soundType: DEFAULT_SOUND_TYPE,
  frequencyRange: [200, 640],
};
