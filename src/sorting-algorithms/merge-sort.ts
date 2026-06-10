import { AlgorithmOptions, SortValue } from '../types';
import { SortingAlgorithm } from './sorting-algorithm';

export class MergeSort extends SortingAlgorithm {
  public sort = async (arr: SortValue[], options: AlgorithmOptions) => {
    switch (options.type) {
      case 'iterative':
        return await this.iterMergeSort(arr);
      case 'recursive':
        return await this.recMergeSort(arr, 0, arr.length);
    }
  };

  private async iterMergeSort(arr: SortValue[]) {
    for (let size = 1; size < arr.length; size *= 2) {
      for (let start = 0; start < arr.length; start += 2 * size) {
        const mid = Math.min(start + size, arr.length);
        const end = Math.min(start + 2 * size, arr.length);
        await this.merge(arr, start, mid, end);
      }
    }
  }

  private async recMergeSort(arr: SortValue[], start: number, end: number) {
    if (end - start <= 1) return;

    const mid = Math.floor((start + end) / 2);
    await this.recMergeSort(arr, start, mid);
    await this.recMergeSort(arr, mid, end);
    await this.merge(arr, start, mid, end);
  }

  private async merge(
    arr: SortValue[],
    start: number,
    mid: number,
    end: number,
  ) {
    const tempArr: SortValue[] = [];
    let i = start;
    let j = mid;
    while (i < mid && j < end) {
      if (await this.context.compare(arr, i, '<', j)) {
        tempArr.push(arr[i]);
        await this.context.registerAuxWrite(arr, i);
        i++;
      } else {
        tempArr.push(arr[j]);
        await this.context.registerAuxWrite(arr, j);
        j++;
      }
    }
    while (i < mid) {
      tempArr.push(arr[i]);
      await this.context.registerAuxWrite(arr, i);
      i++;
    }
    while (j < end) {
      tempArr.push(arr[j]);
      await this.context.registerAuxWrite(arr, j);
      j++;
    }
    for (let k = 0; k < tempArr.length; k++) {
      await this.context.drawAndSwap(arr, start + k, arr.indexOf(tempArr[k]));
    }
  }
}
