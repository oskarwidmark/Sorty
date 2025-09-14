import {
  AppState,
  ColorPreset,
  DisplayType,
  ResetPreset,
  Settings,
  SortName,
  VisualizationType,
} from './types';

export const RAINBOW_BACKGROUND_COLOR = '#282c34';
export const DEFAULT_SOUND_VOLUME = 50;
export const DEFAULT_SOUND_TYPE = 'triangle';

export const INIT_STATE: Omit<AppState, 'settings'> = {
  isSorting: false,
  areSettingsOpen: false,
  shouldPlaySound: false,
  canDraw: false,
  nbrOfSwaps: 0,
  nbrOfComparisons: 0,
  nbrOfAuxWrites: 0,
  tabIndex: 0,
};

export const INIT_SETTINGS: Settings = {
  columnNbr: 100,
  chosenSortAlg: SortName.InsertionSort,
  swapTime: 1,
  compareTime: 1,
  auxWriteTime: 1,
  resetPreset: ResetPreset.Shuffle,
  algorithmOptions: {
    type: 'iterative',
    base: 4,
    shrinkFactor: 1.3,
    heapType: 'max',
  },
  colorPreset: ColorPreset.Rainbow,
  columnColor1: '#ffffff',
  columnColor2: '#ffffff',
  backgroundColor: '#000000',
  highlightColor: '#ff0000',
  visualizationType: VisualizationType.Bars,
  displayType: DisplayType.Full,
  soundVolume: DEFAULT_SOUND_VOLUME,
  soundType: DEFAULT_SOUND_TYPE,
  frequencyRange: [200, 640],
  playSoundOnSwap: false,
  playSoundOnComparison: true,
  playSoundOnAuxWrite: false,
};
