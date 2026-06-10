import { SortValue } from '../types';
import { SortingAlgorithm } from './sorting-algorithm';

export class BubbleSort extends SortingAlgorithm {
  public sort = async (arr: SortValue[]) => {
    let isSorted = false;
    let sortedCount = 0;
    while (!isSorted) {
      isSorted = true;
      for (let i = 1; i < arr.length - sortedCount; i++) {
        if (await this.context.compare(arr, i - 1, '>', i)) {
          await this.context.drawAndSwap(arr, i - 1, i);
          isSorted = false;
        }
      }
      sortedCount++;
    }
  };
}
