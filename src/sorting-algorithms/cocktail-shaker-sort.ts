import { SortValue } from '../types';
import { SortingAlgorithm } from './sorting-algorithm';

export class CocktailShakerSort extends SortingAlgorithm {
  public sort = async (arr: SortValue[]) => {
    let isSorted = false;
    let shouldSortReversed = false;
    let sortedCountRight = 0;
    let sortedCountLeft = 0;
    while (!isSorted) {
      isSorted = true;
      if (!shouldSortReversed) {
        for (
          let i = 1 + sortedCountLeft;
          i < arr.length - sortedCountRight;
          i++
        ) {
          if (await this.context.compare(arr, i, '<', i - 1)) {
            await this.context.drawAndSwap(arr, i, i - 1);
            isSorted = false;
          }
        }
        sortedCountRight++;
      } else {
        for (
          let i = arr.length - 1 - sortedCountRight;
          i > sortedCountLeft;
          i--
        ) {
          if (await this.context.compare(arr, i - 1, '>', i)) {
            await this.context.drawAndSwap(arr, i - 1, i);
            isSorted = false;
          }
        }
        sortedCountLeft++;
      }
      shouldSortReversed = !shouldSortReversed;
    }
  };
}
