import { SortValue } from '../types';
import { SortingAlgorithm } from './sorting-algorithm';

export class AverageSort extends SortingAlgorithm {
  public sort = async (arr: SortValue[]) => {
    await this._averageSort(arr, 0, arr.length);
  };

  private async _averageSort(arr: SortValue[], start: number, end: number) {
    if (end - start <= 1) return;

    let isUniform = true;
    for (let i = start; i < end; i++) {
      if (await this.context.compare(arr, start, '!=', i)) {
        isUniform = false;
        break;
      }
    }
    if (isUniform) return;

    let sum = 0;
    for (let i = start; i < end; i++) {
      await this.context.registerAuxWrite(arr, i);
      sum += arr[i].value;
    }
    const avg = sum / (end - start);

    let mid = start;
    for (let i = start; i < end; i++) {
      if (await this.context.valueCompare(arr, i, '<', avg)) {
        mid++;
      }
    }

    let j = start;
    for (let i = mid; i < end; i++) {
      if (await this.context.valueCompare(arr, i, '<', avg)) {
        while (await this.context.valueCompare(arr, j, '<', avg)) {
          j++;
        }
        await this.context.drawAndSwap(arr, i, j);
        j++;
      }
    }

    await this._averageSort(arr, start, mid);
    await this._averageSort(arr, mid, end);
  }
}
