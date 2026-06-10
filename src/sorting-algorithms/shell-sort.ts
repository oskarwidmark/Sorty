import { SortValue } from '../types';
import { SortingAlgorithm } from './sorting-algorithm';

export class ShellSort extends SortingAlgorithm {
  public sort = async (arr: SortValue[]) => {
    const gaps = [701, 301, 132, 57, 23, 10, 4, 1]; // from https://oeis.org/A102549
    for (const gap of gaps) {
      if (gap > arr.length) continue;
      for (let i = gap; i < arr.length; i++) {
        for (let j = i; j >= gap; j -= gap) {
          if (await this.context.compare(arr, j - gap, '<', j)) {
            break;
          }
          await this.context.drawAndSwap(arr, j - gap, j);
        }
      }
    }
  };
}
