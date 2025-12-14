import { NonCustomOscillatorType } from 'tone/build/esm/source/oscillator/OscillatorInterface';

export enum SortName {
  InsertionSort = 'Insertion Sort',
  SelectionSort = 'Selection Sort',
  CocktailShakerSort = 'Cocktail Shaker Sort',
  BubbleSort = 'Bubble Sort',
  OddEvenSort = 'Odd-Even Sort',
  OddEvenMergesort = `Odd-Even Mergesort`,
  RadixSortLSD = 'Radix Sort (LSD)',
  RadixSortMSD = 'Radix Sort (MSD)',
  QuickSort = 'Quick Sort',
  CombSort = 'Comb Sort',
  ShellSort = 'Shell Sort',
  BitonicSort = 'Bitonic Sort',
  BullySort = 'Bully Sort',
  AverageSort = 'Average Sort',
  Heapsort = 'Heapsort',
  PushSort = 'Push Sort',
}

export type SortAlgorithm = (
  arr: SortValue[],
  options: AlgorithmOptions,
) => Promise<void>;

export type SortValue = { value: number; id: number };

export type AlgorithmOptions = {
  type: 'iterative' | 'recursive';
  base: number;
  shrinkFactor: number;
  heapType: 'max' | 'min';
  parallel: boolean;
  childCount: number;
};

export enum ResetPreset {
  Shuffle = 'Shuffle',
  Sorted = 'Sorted',
  ReverseSorted = 'Reverse Sorted',
}

export type ResetFunction = () => void;

export type Operator = '<' | '>' | '<=' | '>=' | '==' | '!=';

export type DrawData = {
  index: number;
  value: number;
};

export enum VisualizationType {
  Bars = 'Bars',
  Dots = 'Dots',
  Colors = 'Colors',
  Matrix = 'Matrix',
  Spiral = 'Spiral',
}

export enum DisplayType {
  Full = 'Full',
  Square = 'Square',
}

export enum ColorPreset {
  Rainbow = 'Rainbow',
  Custom = 'Custom',
  CustomGradient = 'Custom (gradient)',
}

export type AppState = {
  isSorting: boolean;
  tabIndex: number;
  areSettingsOpen: boolean;
  canDraw: boolean;
  shouldPlaySound: boolean;
  nbrOfSwaps: number;
  nbrOfComparisons: number;
  nbrOfAuxWrites: number;
  settings: Settings;
};

export type Settings = SortSettings & ColorSettings & SoundSettings;

export type SortSettings = {
  chosenSortAlg: SortName;
  columnNbr: number;
  swapTime: number;
  compareTime: number;
  auxWriteTime: number;
  resetPreset: ResetPreset;
  algorithmOptions: AlgorithmOptions;
};

export type ColorSettings = {
  colorPreset: ColorPreset;
  columnColor1: string;
  columnColor2: string;
  highlightColors: HighlightColors;
  backgroundColor: string;
  visualizationType: VisualizationType;
  displayType: DisplayType;
  gapSize: number;
};

export type HighlightType = 'comparison' | 'swap' | 'auxWrite';

type HighlightColors = {
  [key in HighlightType]: string;
};

export type SoundSettings = {
  soundType: NonCustomOscillatorType;
  soundVolume: number;
  frequencyRange: [number, number];
  playSoundOnSwap: boolean;
  playSoundOnComparison: boolean;
  playSoundOnAuxWrite: boolean;
};
