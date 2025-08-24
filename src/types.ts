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

export type Settings = {
  chosenSortAlg: SortName;
  columnNbr: number;
  swapTime: number;
  compareTime: number;
  auxWriteTime: number;
  resetPreset: ResetPreset;
  algorithmOptions: AlgorithmOptions;
  colorPreset: ColorPreset;
  columnColor1: string;
  columnColor2: string;
  backgroundColor: string;
  highlightColor: string;
  soundType: NonCustomOscillatorType;
  soundVolume: number;
  frequencyRange: [number, number];
  playSoundOnSwap: boolean;
  playSoundOnComparison: boolean;
  playSoundOnAuxWrite: boolean;
};
