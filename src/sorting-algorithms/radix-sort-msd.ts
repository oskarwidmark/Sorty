import { AlgorithmOptions, SortValue } from '../types';
import { SortingAlgorithm } from './sorting-algorithm';

export class RadixSortMSD extends SortingAlgorithm {
  public sort = async (arr: SortValue[], options: AlgorithmOptions) => {
    const shift = Math.floor(Math.log(arr.length) / Math.log(options.base));
    await this._msdRadixSort(arr, options, 0, arr.length, shift);
  };

  private async _msdRadixSort(
    arr: SortValue[],
    options: AlgorithmOptions,
    start: number,
    end: number,
    shift: number,
  ) {
    const { base } = options;
    const buckets = Array(base);
    const indexMap: Record<number, number> = {};

    if (end - start === 0) return;

    for (let i = 0; i < base; i++) {
      buckets[i] = [];
    }
    for (let i = start; i < end; i++) {
      const index = Math.floor(arr[i].value / base ** shift) % base;
      buckets[index].push(arr[i]);
      await this.context.registerAuxWrite(arr, i);
      indexMap[arr[i].id] = i;
    }

    const bucketIndices = [];
    let currentIndex = start;

    for (const bucket of buckets) {
      const bucketStart = currentIndex;
      for (const a of bucket) {
        const swapIndex = indexMap[a.id];
        if (swapIndex === currentIndex) {
          currentIndex++;
          continue;
        }
        await this.context.drawAndSwap(arr, currentIndex, swapIndex);
        indexMap[arr[swapIndex].id] = indexMap[arr[currentIndex].id];
        currentIndex++;
      }
      if (shift === 0) continue;
      bucketIndices.push([bucketStart, currentIndex]);
    }
    for (const [bucketStart, bucketEnd] of bucketIndices) {
      await this._msdRadixSort(arr, options, bucketStart, bucketEnd, shift - 1);
    }
  }
}
