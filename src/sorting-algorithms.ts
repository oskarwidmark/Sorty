import {
  Operator,
  SortAlgorithm,
  SortName,
  AlgorithmOptions,
  SortValue,
} from './types';

export class SortingAlgorithms {
  private sortingAlgorithms: Record<SortName, SortAlgorithm> = {
    [SortName.InsertionSort]: this.insertionSort,
    [SortName.SelectionSort]: this.selectionSort,
    [SortName.CocktailShakerSort]: this.cocktailShakerSort,
    [SortName.BubbleSort]: this.bubbleSort,
    [SortName.OddEvenSort]: this.oddEvenSort,
    [SortName.OddEvenMergesort]: this.oddEvenMergesort,
    [SortName.RadixSortLSD]: this.lsdRadixSort,
    [SortName.RadixSortMSD]: this.msdRadixSort,
    [SortName.QuickSort]: this.quickSort,
    [SortName.CombSort]: this.combSort,
    [SortName.ShellSort]: this.shellSort,
    [SortName.BitonicSort]: this.bitonicSort,
    [SortName.BullySort]: this.bullySort,
    [SortName.AverageSort]: this.averageSort,
    [SortName.Heapsort]: this.heapsort,
    // 'Bully Sort 2': this.bullySort2,
  };

  constructor(
    private _columnNbr: number,
    private compare: (
      arr: SortValue[],
      i: number,
      operator: Operator,
      j: number,
    ) => Promise<boolean>,
    private valueCompare: (
      arr: SortValue[],
      i: number,
      operator: Operator,
      value: number,
    ) => Promise<boolean>,
    private drawAndSwap: (
      arr: SortValue[],
      i: number,
      j: number,
    ) => Promise<void>,
  ) {
    this.bindAll();
  }

  bindAll() {
    for (const key of Object.keys(this.sortingAlgorithms) as SortName[]) {
      this.sortingAlgorithms[key] = this.sortingAlgorithms[key].bind(this);
    }
  }

  public set columnNbr(columnNbr: number) {
    this._columnNbr = columnNbr;
  }

  getSortingAlgorithm(name: SortName): SortAlgorithm {
    return this.sortingAlgorithms[name];
  }

  public async bubbleSort(arr: SortValue[]) {
    let isSorted = false;
    let sortedCount = 0;
    while (!isSorted) {
      isSorted = true;
      for (let i = 1; i < arr.length - sortedCount; i++) {
        if (await this.compare(arr, i - 1, '>', i)) {
          await this.drawAndSwap(arr, i - 1, i);
          isSorted = false;
        }
      }
      sortedCount++;
    }
  }

  public async oddEvenSort(arr: SortValue[]) {
    let isSorted = false;
    while (!isSorted) {
      isSorted = true;
      const oddSorter = async () => {
        for (let i = 1; i < arr.length; i += 2) {
          if (await this.compare(arr, i - 1, '>', i)) {
            await this.drawAndSwap(arr, i - 1, i);
            isSorted = false;
          }
        }
      };
      const evenSorter = async () => {
        for (let i = 2; i < arr.length; i += 2) {
          if (await this.compare(arr, i - 1, '>', i)) {
            await this.drawAndSwap(arr, i - 1, i);
            isSorted = false;
          }
        }
      };
      // TODO: run "in parallel" when drawing looks better
      // await Promise.all([oddSorter(), evenSorter()]);
      await oddSorter();
      await evenSorter();
    }
  }

  public async oddEvenMergesort(arr: SortValue[], options: AlgorithmOptions) {
    switch (options.type) {
      case 'iterative':
        return await this.iterOddEvenMergesort(arr);
      case 'recursive':
        return await this.recOddEvenMergesort(arr, 0, this._columnNbr);
    }
  }

  // TODO: make "parallel"(?)
  public async iterOddEvenMergesort(arr: SortValue[]) {
    for (let p = 1; p < arr.length; p *= 2) {
      for (let k = p; k > 0; k = Math.floor(k / 2)) {
        for (let j = k % p; j < arr.length - k; j += 2 * k) {
          for (let i = 0; i < k && i < arr.length - j - k; i++) {
            const index1 = i + j;
            const index2 = i + j + k;
            if (Math.floor(index1 / (p * 2)) == Math.floor(index2 / (p * 2))) {
              if (await this.compare(arr, index1, '>', index2)) {
                await this.drawAndSwap(arr, index1, index2);
              }
            }
          }
        }
      }
    }
  }

  private async recOddEvenMergesort(
    arr: SortValue[],
    start: number,
    end: number,
  ) {
    if (end - start <= 1) return;

    const mid = Math.floor((start + end) / 2);
    await this.recOddEvenMergesort(arr, start, mid);
    await this.recOddEvenMergesort(arr, mid, end);

    await this.oddEvenMerge(arr, start, end, 1);
  }

  private async oddEvenMerge(
    arr: SortValue[],
    start: number,
    end: number,
    dist: number,
  ) {
    const newDist = dist * 2;
    if (end - start <= newDist && start + dist < arr.length) {
      if (await this.compare(arr, start, '>', start + dist)) {
        await this.drawAndSwap(arr, start, start + dist);
      }
      return;
    }

    // Even indices
    await this.oddEvenMerge(arr, start, end, newDist);
    // Odd indices
    await this.oddEvenMerge(arr, start + dist, end, newDist);

    for (let i = start + dist; i < end - dist; i += newDist) {
      const j = i + dist;
      if (await this.compare(arr, i, '>', j)) {
        await this.drawAndSwap(arr, i, j);
      }
    }
  }

  public async combSort(arr: SortValue[], options: AlgorithmOptions) {
    let gap = this._columnNbr;
    const { shrinkFactor } = options;
    let isSorted = false;
    while (!isSorted) {
      gap = Math.floor(gap / shrinkFactor);
      if (gap <= 1) {
        gap = 1;
        isSorted = true;
      }
      for (let i = gap; i < arr.length; i++) {
        if (await this.compare(arr, i - gap, '>', i)) {
          await this.drawAndSwap(arr, i - gap, i);
          isSorted = false;
        }
      }
    }
  }

  public async insertionSort(arr: SortValue[]) {
    for (let i = 1; i < arr.length; i++) {
      let j = i;
      while (j > 0 && (await this.compare(arr, j - 1, '>', j))) {
        await this.drawAndSwap(arr, j - 1, j);
        j--;
      }
    }
  }

  public async lsdRadixSort(arr: SortValue[], options: AlgorithmOptions) {
    const { base } = options;
    const buckets = Array(base);
    const indexMap: Record<number, number> = {};
    let shift = 0;
    const isSorted = false;
    while (!isSorted) {
      for (let i = 0; i < base; i++) {
        buckets[i] = [];
      }
      for (let i = 0; i < arr.length; i++) {
        const index = Math.floor(arr[i].value / base ** shift) % base;
        buckets[index].push(arr[i]);
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
          await this.drawAndSwap(arr, currentIndex, swapIndex);

          indexMap[arr[swapIndex].id] = indexMap[arr[currentIndex].id];
          currentIndex++;
        }
      }
    }
  }

  public async msdRadixSort(
    arr: SortValue[],
    options: AlgorithmOptions,
    start = 0,
    end = this._columnNbr,
    shift = Math.floor(Math.log(this._columnNbr) / Math.log(options.base)),
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
        await this.drawAndSwap(arr, currentIndex, swapIndex);

        indexMap[arr[swapIndex].id] = indexMap[arr[currentIndex].id];
        currentIndex++;
      }
      if (shift === 0) continue;

      bucketIndices.push([bucketStart, currentIndex]);
    }
    for (const [bucketStart, bucketEnd] of bucketIndices) {
      await this.msdRadixSort(arr, options, bucketStart, bucketEnd, shift - 1);
    }
  }

  public async selectionSort(arr: SortValue[]) {
    for (let i = 0; i < arr.length; i++) {
      let curJ = i;
      for (let j = i + 1; j < arr.length; j++) {
        if (await this.compare(arr, j, '<', curJ)) {
          curJ = j;
        }
      }
      if (curJ !== i) {
        await this.drawAndSwap(arr, curJ, i);
      }
    }
  }

  public async cocktailShakerSort(arr: SortValue[]) {
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
          if (await this.compare(arr, i, '<', i - 1)) {
            await this.drawAndSwap(arr, i, i - 1);
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
          if (await this.compare(arr, i - 1, '>', i)) {
            await this.drawAndSwap(arr, i - 1, i);
            isSorted = false;
          }
        }
        sortedCountLeft++;
      }
      shouldSortReversed = !shouldSortReversed;
    }
  }

  // TODO: make "parallel"(?)
  public async iterBitonicSort(arr: SortValue[]) {
    for (let k = 2; k <= arr.length; k *= 2) {
      for (let j = k / 2; j > 0; j = Math.floor(j / 2)) {
        for (let i = 0; i < arr.length - j; i++) {
          // When we reach the bit for j, we can skip to the next part,
          // since we already have compared all pairs for this sequence.
          if (i & j) {
            continue;
          }
          const l = i + j;
          // i & k is false for the first half of the bitonic sequence (ex: k = 4, i = 0, 1, 2, 3, 8, 9, 10, 11)
          if (!(i & k) && (await this.compare(arr, i, '>', l))) {
            await this.drawAndSwap(arr, i, l);
          }
          // i & k is true for the second half of the bitonic sequence (ex: k = 4, i = 4, 5, 6, 7, 12, 13, 14, 15)
          if (i & k && (await this.compare(arr, i, '<', l))) {
            await this.drawAndSwap(arr, l, i);
          }
        }
      }
    }
  }

  // TODO: make "parallel"(?)
  public async bitonicSort(arr: SortValue[], options: AlgorithmOptions) {
    switch (options.type) {
      case 'iterative':
        return await this.iterBitonicSort(arr);
      case 'recursive':
        return await this.recBitonicSort(arr, 0, this._columnNbr, 'asc');
    }
  }

  private async recBitonicSort(
    arr: SortValue[],
    start: number,
    end: number,
    direction: 'asc' | 'desc',
  ) {
    if (end - start <= 1) return;

    const mid = Math.floor((start + end) / 2);
    await this.recBitonicSort(arr, start, mid, 'asc');
    await this.recBitonicSort(arr, mid, end, 'desc');

    await this.bitonicMerge(arr, start, end, direction);
  }

  private async bitonicMerge(
    arr: SortValue[],
    start: number,
    end: number,
    direction: 'asc' | 'desc',
  ) {
    if (end - start <= 1) return;

    const mid = Math.floor((start + end) / 2);
    const j = Math.floor((end - start) / 2);

    for (let i = start; i < mid && i + j < arr.length; i++) {
      if (direction === 'asc' && (await this.compare(arr, i, '>', i + j))) {
        await this.drawAndSwap(arr, i, i + j);
      }
      if (direction === 'desc' && (await this.compare(arr, i, '<', i + j))) {
        await this.drawAndSwap(arr, i, i + j);
      }
    }

    await this.bitonicMerge(arr, start, mid, direction);
    await this.bitonicMerge(arr, mid, end, direction);
  }

  // Elmayo's brain child
  public async bullySort(arr: SortValue[]) {
    let isSorted = false;
    while (!isSorted) {
      isSorted = true;
      let swapIndex = 0;
      for (let i = 1; i < arr.length; i++) {
        if (
          (await this.compare(arr, i - 1, '>', i)) &&
          (i + 1 >= arr.length || (await this.compare(arr, i + 1, '>=', i)))
        ) {
          for (let j = swapIndex; j < i; j++) {
            if (
              !(
                (await this.compare(arr, i - 1, '>', j)) &&
                (i + 1 >= arr.length ||
                  (await this.compare(arr, i + 1, '>=', j)))
              )
            ) {
              await this.drawAndSwap(arr, j, i);
              isSorted = false;
              swapIndex++;
              break;
            }
          }
        }
      }
    }
  }

  /* Not quite there yet
public async   bullySort2(arr: SortValue[]){
    let isSorted = false;
    while (!isSorted) {
      isSorted = true;
      let swapIndex = 0;
public async       const test(arr, i){ 
        if (arr[i - 1].x > arr[i].x && (arr[i+1]?.x ?? Infinity) > arr[i].x) {
          if (!((arr[i - 1]?.x ?? -Infinity) > arr[swapIndex].x && (arr[i+1]?.x ?? Infinity) > arr[swapIndex].x)) {
            isSorted = false;
            await this.drawAndSwap(arr, swapIndex, i);
            this.highlight(arr, [swapIndex, i])
            await sleep(this.state.swapTime);
            if (swapIndex > 0) {
              const temp = swapIndex;
              swapIndex = 0;
              await test(arr, temp);
            }
          } else {
            swapIndex++;
            await test(arr, i);
          }
        }
      }
      for (let i = 1; i < arr.length; i++) {
        await test(arr, i);
      }
    }
  }
  */

  //#region merge sort
  /* In-place merge sort is complicated...
public async   mergeSort(arr, start, end){
    if (start >= end) return
    if (end-start === 1) {
      if (arr[start] > arr[end]) {
        await this.drawAndSwap(arr, start, end);
        await sleep(this.state.swapTime);
      }
    }

    const mid = Math.floor((start+end) / 2)
    this.mergeSort(arr, start, mid)
    this.mergeSort(arr, mid+1, end)
    let i = start
    let j = mid+1
    while (i < mid && j < end) {
      if (arr[i] > arr[j]) {
        await this.drawAndSwap(arr, i, j);
        await sleep(this.state.swapTime);
      }
    }
  }
  */
  //#endregion

  public async quickSort(arr: SortValue[]) {
    await this._quickSort(arr, 0, this._columnNbr - 1);
  }

  private async _quickSort(arr: SortValue[], start: number, end: number) {
    if (start >= end) return;

    const mid = Math.floor((start + end) / 2);

    if (await this.compare(arr, mid, '<', start)) {
      await this.drawAndSwap(arr, start, mid);
    }
    if (await this.compare(arr, end, '<', start)) {
      await this.drawAndSwap(arr, start, end);
    }
    if (await this.compare(arr, mid, '<', end)) {
      await this.drawAndSwap(arr, mid, end);
    }

    let i = start;
    for (let j = start; j < end; j++) {
      if (await this.compare(arr, j, '<', end)) {
        await this.drawAndSwap(arr, i, j);
        i++;
      }
    }
    await this.drawAndSwap(arr, i, end);

    await this._quickSort(arr, start, i - 1);
    await this._quickSort(arr, i + 1, end);
  }

  public async shellSort(arr: SortValue[]) {
    const gaps = [701, 301, 132, 57, 23, 10, 4, 1]; // from https://oeis.org/A102549
    for (const gap of gaps) {
      if (gap > this._columnNbr) continue;
      for (let i = gap; i < this._columnNbr; i++) {
        for (let j = i; j >= gap; j -= gap) {
          if (await this.compare(arr, j - gap, '<', j)) {
            break;
          }
          await this.drawAndSwap(arr, j - gap, j);
        }
      }
    }
  }

  public async averageSort(arr: SortValue[]) {
    await this._averageSort(arr, 0, this._columnNbr);
  }

  public async _averageSort(arr: SortValue[], start: number, end: number) {
    if (end - start <= 1) return;

    let sum = 0;
    for (let i = start; i < end; i++) {
      // for highlighting and counting comparison
      // TODO: replace
      await this.valueCompare(arr, i, '>', 0);
      sum += arr[i].value;
    }
    const avg = sum / (end - start);
    const mid = Math.floor((start + end) / 2);

    let j = start;
    for (let i = mid; i < end; i++) {
      if (await this.valueCompare(arr, i, '<', avg)) {
        while (await this.valueCompare(arr, j, '<', avg)) {
          j++;
        }
        await this.drawAndSwap(arr, i, j);
        j++;
      }
    }

    await this._averageSort(arr, start, mid);
    await this._averageSort(arr, mid, end);
  }

  public async heapsort(arr: SortValue[], options: AlgorithmOptions) {
    switch (options.heapType) {
      case 'min':
        return await this.minHeapsort(arr);
      case 'max':
        return await this.maxHeapsort(arr);
    }
  }

  private async minHeapsort(arr: SortValue[]) {
    for (let i = Math.ceil(arr.length / 2) + 1; i < arr.length; i++) {
      await this.minHeapify(arr, 0, i);
    }
    for (let i = 0; i < arr.length; i++) {
      await this.drawAndSwap(arr, arr.length - 1, i);
      await this.minHeapify(arr, i, arr.length - 1);
    }
  }

  private async maxHeapsort(arr: SortValue[]) {
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
      await this.maxHeapify(arr, arr.length, i);
    }
    for (let i = arr.length - 1; i > 0; i--) {
      await this.drawAndSwap(arr, 0, i);
      await this.maxHeapify(arr, i, 0);
    }
  }

  // This a reversed heap, with the smallest element at the last index
  private async minHeapify(arr: SortValue[], n: number, i: number) {
    let smallestIndex = i;
    const left = arr.length - 1 - (2 * (arr.length - 1 - i) + 2);
    const right = arr.length - 1 - (2 * (arr.length - 1 - i) + 1);
    if (left > n && (await this.compare(arr, smallestIndex, '>', left))) {
      smallestIndex = left;
    }
    if (right > n && (await this.compare(arr, smallestIndex, '>', right))) {
      smallestIndex = right;
    }
    if (smallestIndex !== i) {
      await this.drawAndSwap(arr, i, smallestIndex);
      await this.minHeapify(arr, n, smallestIndex);
    }
  }

  private async maxHeapify(arr: SortValue[], n: number, i: number) {
    let largestIndex = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < n && (await this.compare(arr, left, '>', largestIndex))) {
      largestIndex = left;
    }
    if (right < n && (await this.compare(arr, right, '>', largestIndex))) {
      largestIndex = right;
    }
    if (largestIndex !== i) {
      await this.drawAndSwap(arr, i, largestIndex);
      await this.maxHeapify(arr, n, largestIndex);
    }
  }
}
