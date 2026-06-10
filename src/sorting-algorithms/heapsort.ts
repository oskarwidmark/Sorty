import { AlgorithmOptions, SortValue } from '../types';
import { SortingAlgorithm } from './sorting-algorithm';

export class Heapsort extends SortingAlgorithm {
  public sort = async (arr: SortValue[], options: AlgorithmOptions) => {
    switch (options.heapType) {
      case 'min':
        return await this.minHeapsort(arr, options.childCount);
      case 'max':
        return await this.maxHeapsort(arr, options.childCount);
    }
  };

  private async minHeapsort(arr: SortValue[], childCount: number) {
    for (let i = Math.ceil(arr.length / 2) + 1; i < arr.length; i++) {
      await this.minHeapify(arr, 0, i, childCount);
    }
    for (let i = 0; i < arr.length; i++) {
      await this.context.drawAndSwap(arr, arr.length - 1, i);
      await this.minHeapify(arr, i, arr.length - 1, childCount);
    }
  }

  private async maxHeapsort(arr: SortValue[], childCount: number) {
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
      await this.maxHeapify(arr, arr.length, i, childCount);
    }
    for (let i = arr.length - 1; i > 0; i--) {
      await this.context.drawAndSwap(arr, 0, i);
      await this.maxHeapify(arr, i, 0, childCount);
    }
  }

  // This a reversed heap, with the smallest element at the last index
  private async minHeapify(
    arr: SortValue[],
    n: number,
    i: number,
    childCount: number,
  ) {
    let smallestIndex = i;
    for (let c = 0; c < childCount; c++) {
      const childIndex =
        arr.length - 1 - (childCount * (arr.length - 1 - i) + 1 + c);
      if (
        childIndex > n &&
        (await this.context.compare(arr, childIndex, '<', smallestIndex))
      ) {
        smallestIndex = childIndex;
      }
    }
    if (smallestIndex !== i) {
      await this.context.drawAndSwap(arr, i, smallestIndex);
      await this.minHeapify(arr, n, smallestIndex, childCount);
    }
  }

  private async maxHeapify(
    arr: SortValue[],
    n: number,
    i: number,
    childCount: number,
  ) {
    let largestIndex = i;
    for (let c = 0; c < childCount; c++) {
      const childIndex = childCount * i + 1 + c;
      if (
        childIndex < n &&
        (await this.context.compare(arr, childIndex, '>', largestIndex))
      ) {
        largestIndex = childIndex;
      }
    }

    if (largestIndex !== i) {
      await this.context.drawAndSwap(arr, i, largestIndex, childCount);
      await this.maxHeapify(arr, n, largestIndex, childCount);
    }
  }
}
