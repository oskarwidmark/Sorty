import { SortValue } from '../types';
import { SortingAlgorithm } from './sorting-algorithm';

// Does not handle elements with the same value!
export class BullySort extends SortingAlgorithm {
  public sort = async (arr: SortValue[]) => {
    let isSorted = false;
    let sortedFrom = arr.length;
    while (!isSorted) {
      isSorted = true;
      let swapIndex = 0;
      const maxI = sortedFrom;
      for (let i = 1; i < maxI; i++) {
        if (
          (await this.context.compare(arr, i - 1, '<=', i)) ||
          (i + 1 < arr.length &&
            (await this.context.compare(arr, i + 1, '<', i)))
        ) {
          // Not bullied
          continue;
        }

        sortedFrom = Math.min(i + 2, arr.length);

        // Find smallest bully
        let smallestIndex = i - 1;
        if (
          i + 1 < arr.length &&
          (await this.context.compare(arr, i + 1, '<', smallestIndex))
        ) {
          smallestIndex = i + 1;
        }

        // Find non-bullyable to swap with
        for (let j = swapIndex; j < i; j++) {
          if (await this.context.compare(arr, smallestIndex, '>', j)) {
            continue;
          }

          await this.context.drawAndSwap(arr, j, i);
          isSorted = false;
          swapIndex = j + 1;
          break;
        }
      }
    }
  };
}
