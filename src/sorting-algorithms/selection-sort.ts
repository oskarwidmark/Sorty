import { SortValue } from '../types';
import { SortingAlgorithm } from './sorting-algorithm';

export class SelectionSort extends SortingAlgorithm {
  public sort = async (arr: SortValue[]) => {
    for (let i = 0; i < arr.length; i++) {
      let curJ = i;
      for (let j = i + 1; j < arr.length; j++) {
        if (await this.context.compare(arr, j, '<', curJ)) {
          curJ = j;
        }
      }
      if (curJ !== i) {
        await this.context.drawAndSwap(arr, curJ, i);
      }
    }
  };
}
