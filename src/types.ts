export enum SortName {
  InsertionSort = 'Insertion Sort',
  SelectionSort = 'Selection Sort',
  CocktailShakerSort = 'Cocktail Shaker Sort',
  BubbleSort = 'Bubble Sort',
  RadixSortLSD = 'Radix Sort (LSD)',
  RadixSortMSD = 'Radix Sort (MSD)',
  QuickSort = 'Quick Sort',
  CombSort = 'Comb Sort',
  ShellSort = 'Shell Sort',
  BullySort = 'Bully Sort',
}

export type SortAlgorithm = (arr: SortValue[]) => Promise<void>;

export type SortValue = { value: number; id: number };

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
