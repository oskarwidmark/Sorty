import { SortValue } from '../types';
import { SortingAlgorithm } from './sorting-algorithm';

export class PushSort extends SortingAlgorithm {
  public sort = async (arr: SortValue[]) => {
    let isSorted = false;
    let lastIndex = arr.length - 1;

    while (!isSorted) {
      isSorted = true;
      let stackSize = 0;
      const end = lastIndex;

      for (let i = 0; i < end; i++) {
        if (await this.context.compare(arr, i, '>', i + 1)) {
          lastIndex = i;
          isSorted = false;
          await this.context.drawAndSwap(arr, i, i + 1);
          for (let j = i; j > i - stackSize; j--) {
            await this.context.drawAndSwap(arr, j - 1, j);
          }
        } else {
          stackSize++;
        }
      }
    }
  };
}
