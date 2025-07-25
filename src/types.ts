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

export type Operator = '<' | '>' | '<=' | '>=';

export type DrawData = {
  index: number;
  value: number;
};

export enum SortType {
  Comparison = 'Comparison',
  Distribution = 'Distribution',
}

export enum ColorPreset {
  Rainbow = 'Rainbow',
  Custom = 'Custom',
  CustomGradient = 'Custom (gradient)',
}
