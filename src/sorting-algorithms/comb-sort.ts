import { AlgorithmOptions, SortValue } from '../types';
import { SortingAlgorithm } from './sorting-algorithm';

export class CombSort extends SortingAlgorithm {
  public sort = async (arr: SortValue[], options: AlgorithmOptions) => {
    let gap = arr.length;
    const { shrinkFactor } = options;
    let isSorted = false;
    while (!isSorted) {
      gap = Math.floor(gap / shrinkFactor);
      if (gap <= 1) {
        gap = 1;
        isSorted = true;
      }
      for (let i = gap; i < arr.length; i++) {
        if (await this.context.compare(arr, i - gap, '>', i)) {
          await this.context.drawAndSwap(arr, i - gap, i);
          isSorted = false;
        }
      }
    }
  };
}
