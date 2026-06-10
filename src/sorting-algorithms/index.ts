import {
  CompareFn,
  DrawAndSwapFn,
  RegisterAuxWriteFn,
  SortFn,
  SortName,
  ValueCompareFn,
} from '../types';
import { AverageSort } from './average-sort';
import { BitonicSort } from './bitonic-sort';
import { BubbleSort } from './bubble-sort';
import { CocktailShakerSort } from './cocktail-shaker-sort';
import { CombSort } from './comb-sort';
import { CreaseSort } from './crease-sort';
import { FoldSort } from './fold-sort';
import { Heapsort } from './heapsort';
import { InsertionSort } from './insertion-sort';
import { MergeSort } from './merge-sort';
import { OddEvenMergesort } from './odd-even-mergesort';
import { OddEvenSort } from './odd-even-sort';
import { PushSort } from './push-sort';
import { QuickSort } from './quick-sort';
import { RadixSortLSD } from './radix-sort-lsd';
import { RadixSortMSD } from './radix-sort-msd';
import { SelectionSort } from './selection-sort';
import { ShellSort } from './shell-sort';
import { SortingAlgorithm } from './sorting-algorithm';

export class SortingAlgorithms {
  sortingAlgorithms: Record<SortName, SortingAlgorithm>;

  constructor(context: {
    compare: CompareFn;
    valueCompare: ValueCompareFn;
    drawAndSwap: DrawAndSwapFn;
    registerAuxWrite: RegisterAuxWriteFn;
  }) {
    this.sortingAlgorithms = {
      [SortName.InsertionSort]: new InsertionSort(context),
      [SortName.SelectionSort]: new SelectionSort(context),
      [SortName.CocktailShakerSort]: new CocktailShakerSort(context),
      [SortName.BubbleSort]: new BubbleSort(context),
      [SortName.OddEvenSort]: new OddEvenSort(context),
      [SortName.OddEvenMergesort]: new OddEvenMergesort(context),
      [SortName.RadixSortLSD]: new RadixSortLSD(context),
      [SortName.RadixSortMSD]: new RadixSortMSD(context),
      [SortName.QuickSort]: new QuickSort(context),
      [SortName.CombSort]: new CombSort(context),
      [SortName.ShellSort]: new ShellSort(context),
      [SortName.BitonicSort]: new BitonicSort(context),
      // [SortName.BullySort]: new BullySort(context), // Does not handle elements with same value!
      [SortName.AverageSort]: new AverageSort(context),
      [SortName.Heapsort]: new Heapsort(context),
      [SortName.PushSort]: new PushSort(context),
      [SortName.FoldSort]: new FoldSort(context),
      [SortName.MergeSort]: new MergeSort(context),
      [SortName.CreaseSort]: new CreaseSort(context),
      // 'Bully Sort 2': this.bullySort2,
    };
  }

  getSortingAlgorithm(name: SortName): SortFn {
    return this.sortingAlgorithms[name].sort;
  }
}
