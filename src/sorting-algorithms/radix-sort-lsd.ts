import { AlgorithmOptions, SortValue } from '../types';
import { SortingAlgorithm } from './sorting-algorithm';

export class RadixSortLSD extends SortingAlgorithm {
  public sort = async (arr: SortValue[], options: AlgorithmOptions) => {
    const { base } = options;
    const buckets = Array(base);
    const indexMap: Record<number, number> = {};
    let shift = 0;
    const isSorted = false;
    while (!isSorted) {
      if (base ** shift > arr.length) {
        break;
      }
      for (let i = 0; i < base; i++) {
        buckets[i] = [];
      }
      for (let i = 0; i < arr.length; i++) {
        const index = Math.floor(arr[i].value / base ** shift) % base;
        buckets[index].push(arr[i]);
        await this.context.registerAuxWrite(arr, i);
        indexMap[arr[i].id] = i;
      }
      shift++;
      let currentIndex = 0;

      if (buckets[0].length === arr.length) {
        break;
      }

      for (const bucket of buckets) {
        for (const a of bucket) {
          const swapIndex = indexMap[a.id];
          await this.context.drawAndSwap(arr, currentIndex, swapIndex);

          indexMap[arr[swapIndex].id] = indexMap[arr[currentIndex].id];
          currentIndex++;
        }
      }
    }
  };
}
