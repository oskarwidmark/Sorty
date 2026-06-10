import { SortValue } from '../types';
import { SortingAlgorithm } from './sorting-algorithm';

export class QuickSort extends SortingAlgorithm {
  public sort = async (arr: SortValue[]) => {
    await this._quickSort(arr, 0, arr.length - 1);
  };

  private async _quickSort(arr: SortValue[], start: number, end: number) {
    if (start >= end) return;

    const mid = Math.floor((start + end) / 2);

    if (await this.context.compare(arr, mid, '<', start)) {
      await this.context.drawAndSwap(arr, start, mid);
    }
    if (await this.context.compare(arr, end, '<', start)) {
      await this.context.drawAndSwap(arr, start, end);
    }
    if (await this.context.compare(arr, mid, '<', end)) {
      await this.context.drawAndSwap(arr, mid, end);
    }

    let i = start;
    for (let j = start; j < end; j++) {
      if (await this.context.compare(arr, j, '<', end)) {
        await this.context.drawAndSwap(arr, i, j);
        i++;
      }
    }
    await this.context.drawAndSwap(arr, i, end);

    await this._quickSort(arr, start, i - 1);
    await this._quickSort(arr, i + 1, end);
  }
}
