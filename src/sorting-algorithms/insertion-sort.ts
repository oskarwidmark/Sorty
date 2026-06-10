import { SortValue } from '../types';
import { SortingAlgorithm } from './sorting-algorithm';

export class InsertionSort extends SortingAlgorithm {
  public sort = async (arr: SortValue[]) => {
    for (let i = 1; i < arr.length; i++) {
      let j = i;
      while (j > 0 && (await this.context.compare(arr, j - 1, '>', j))) {
        await this.context.drawAndSwap(arr, j - 1, j);
        j--;
      }
    }
  };
}
