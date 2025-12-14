import {
  AlgorithmOptions,
  Operator,
  SortAlgorithm,
  SortName,
  SortValue,
} from './types';
import { runFunctions } from './utils';

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
    [SortName.PushSort]: this.pushSort,
    // 'Bully Sort 2': this.bullySort2,
  };

  constructor(
    private context: {
      columnNbr: number;
      compare: (
        arr: SortValue[],
        i: number,
        operator: Operator,
        j: number,
        drawIteration?: number,
      ) => Promise<boolean>;
      valueCompare: (
        arr: SortValue[],
        i: number,
        operator: Operator,
        value: number,
        drawIteration?: number,
      ) => Promise<boolean>;
      drawAndSwap: (
        arr: SortValue[],
        i: number,
        j: number,
        drawIteration?: number,
      ) => Promise<void>;
      registerAuxWrite: (
        arr: SortValue[],
        i: number,
        drawIteration?: number,
      ) => Promise<void>;
    },
  ) {
    this.bindAll();
  }

  bindAll() {
    for (const key of Object.keys(this.sortingAlgorithms) as SortName[]) {
      this.sortingAlgorithms[key] = this.sortingAlgorithms[key].bind(this);
    }
  }

  public set columnNbr(columnNbr: number) {
    this.context.columnNbr = columnNbr;
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
        if (await this.context.compare(arr, i - 1, '>', i)) {
          await this.context.drawAndSwap(arr, i - 1, i);
          isSorted = false;
        }
      }
      sortedCount++;
    }
  }

  public async oddEvenSort(arr: SortValue[], options: AlgorithmOptions) {
    let isSorted = false;
    let drawIteration = 0;
    while (!isSorted) {
      isSorted = true;
      const oddSorter = async () => {
        for (let i = 1; i < arr.length; i += 2) {
          if (
            await this.context.compare(
              arr,
              i - 1,
              '>',
              i,
              options.parallel ? drawIteration + 0.5 : undefined,
            )
          ) {
            await this.context.drawAndSwap(
              arr,
              i - 1,
              i,
              options.parallel ? drawIteration : undefined,
            );
            isSorted = false;
          }
        }
      };
      const evenSorter = async () => {
        for (let i = 2; i < arr.length; i += 2) {
          if (
            await this.context.compare(
              arr,
              i - 1,
              '>',
              i,
              options.parallel ? drawIteration + 0.5 : undefined,
            )
          ) {
            await this.context.drawAndSwap(
              arr,
              i - 1,
              i,
              options.parallel ? drawIteration : undefined,
            );
            isSorted = false;
          }
        }
      };
      await runFunctions([oddSorter, evenSorter], options.parallel);
      drawIteration++;
    }
  }

  public async oddEvenMergesort(arr: SortValue[], options: AlgorithmOptions) {
    switch (options.type) {
      case 'iterative':
        return await this.iterOddEvenMergesort(arr, options);
      case 'recursive':
        return await this.recOddEvenMergesort(
          arr,
          0,
          this.context.columnNbr,
          options,
        );
    }
  }

  public async iterOddEvenMergesort(
    arr: SortValue[],
    options: AlgorithmOptions,
  ) {
    let drawIteration = 0;
    for (let p = 1; p < arr.length; p *= 2) {
      for (let k = p; k > 0; k = Math.floor(k / 2)) {
        const fns = [];
        for (let j = k % p; j < arr.length - k; j += 2 * k) {
          for (let i = 0; i < k && i < arr.length - j - k; i++) {
            fns.push(async () => {
              const index1 = i + j;
              const index2 = i + j + k;
              if (
                Math.floor(index1 / (p * 2)) == Math.floor(index2 / (p * 2))
              ) {
                if (
                  await this.context.compare(
                    arr,
                    index1,
                    '>',
                    index2,
                    options.parallel ? drawIteration + 0.5 : undefined,
                  )
                ) {
                  await this.context.drawAndSwap(
                    arr,
                    index1,
                    index2,
                    drawIteration,
                  );
                }
              }
            });
          }
        }
        await runFunctions(fns, options.parallel);
        drawIteration++;
      }
    }
  }

  // Draw iteration highlighting does not work properly, since a swapTime > 0
  // introduces desyncs, where some recursive branches have few swaps while
  // others have many. This causes drawIteration to differ in the draw steps,
  // leading to flickering.
  private async recOddEvenMergesort(
    arr: SortValue[],
    start: number,
    end: number,
    options: AlgorithmOptions,
    drawIteration = 0,
  ) {
    if (end - start <= 1) return;

    const mid = Math.floor((start + end) / 2);
    const sorts = [
      () =>
        this.recOddEvenMergesort(arr, start, mid, options, drawIteration + 1),
      () => this.recOddEvenMergesort(arr, mid, end, options, drawIteration + 1),
    ];

    await runFunctions(sorts, options.parallel);

    await this.oddEvenMerge(arr, start, end, 1, options, drawIteration);
  }

  private async oddEvenMerge(
    arr: SortValue[],
    start: number,
    end: number,
    dist: number,
    options: AlgorithmOptions,
    drawIteration: number,
  ) {
    const newDist = dist * 2;
    if (end - start <= newDist && start + dist < arr.length) {
      if (
        await this.context.compare(
          arr,
          start,
          '>',
          start + dist,
          options.parallel ? drawIteration + 0.5 : undefined,
        )
      ) {
        await this.context.drawAndSwap(
          arr,
          start,
          start + dist,
          options.parallel ? drawIteration : undefined,
        );
      }
      return;
    }

    const merges = [
      // Even indices
      () =>
        this.oddEvenMerge(arr, start, end, newDist, options, drawIteration + 1),
      // Odd indices
      () =>
        this.oddEvenMerge(
          arr,
          start + dist,
          end,
          newDist,
          options,
          drawIteration + 1,
        ),
    ];

    await runFunctions(merges, options.parallel);

    const fns = [];
    for (let i = start + dist; i < end - dist; i += newDist) {
      fns.push(async () => {
        const j = i + dist;
        if (
          await this.context.compare(
            arr,
            i,
            '>',
            j,
            options.parallel ? drawIteration + 0.5 : undefined,
          )
        ) {
          await this.context.drawAndSwap(
            arr,
            i,
            j,
            options.parallel ? drawIteration : undefined,
          );
        }
      });
    }

    await runFunctions(fns, options.parallel);
  }

  public async combSort(arr: SortValue[], options: AlgorithmOptions) {
    let gap = this.context.columnNbr;
    const { shrinkFactor } = options;
    let isSorted = false;
    while (!isSorted) {
      gap = Math.floor(gap / shrinkFactor);
      if (gap <= 1) {
        gap = 1;
        isSorted = true;
      }
      for (let i = gap; i < arr.length; i++) {
        if (await this.context.compare(arr, i - gap, '>', i)) {
          await this.context.drawAndSwap(arr, i - gap, i);
          isSorted = false;
        }
      }
    }
  }

  public async insertionSort(arr: SortValue[]) {
    for (let i = 1; i < arr.length; i++) {
      let j = i;
      while (j > 0 && (await this.context.compare(arr, j - 1, '>', j))) {
        await this.context.drawAndSwap(arr, j - 1, j);
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
  }

  public async msdRadixSort(
    arr: SortValue[],
    options: AlgorithmOptions,
    start = 0,
    end = this.context.columnNbr,
    shift = Math.floor(
      Math.log(this.context.columnNbr) / Math.log(options.base),
    ),
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
      await this.msdRadixSort(arr, options, bucketStart, bucketEnd, shift - 1);
    }
  }

  public async selectionSort(arr: SortValue[]) {
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
  }

  public async iterBitonicSort(arr: SortValue[], options: AlgorithmOptions) {
    let drawIteration = 0;
    for (let k = 2; k <= arr.length; k *= 2) {
      for (let j = k / 2; j > 0; j = Math.floor(j / 2)) {
        const fns = [];
        for (let i = 0; i < arr.length - j; i++) {
          // When we reach the bit for j, we can skip to the next part,
          // since we already have compared all pairs for this sequence.
          if (i & j) {
            continue;
          }
          fns.push(async () => {
            const l = i + j;
            // i & k is false for the first half of the bitonic sequence (ex: k = 4, i = 0, 1, 2, 3, 8, 9, 10, 11)
            if (
              !(i & k) &&
              (await this.context.compare(
                arr,
                i,
                '>',
                l,
                options.parallel ? drawIteration + 0.5 : undefined,
              ))
            ) {
              await this.context.drawAndSwap(
                arr,
                i,
                l,
                options.parallel ? drawIteration : undefined,
              );
            }
            // i & k is true for the second half of the bitonic sequence (ex: k = 4, i = 4, 5, 6, 7, 12, 13, 14, 15)
            if (
              i & k &&
              (await this.context.compare(
                arr,
                i,
                '<',
                l,
                options.parallel ? drawIteration + 0.5 : undefined,
              ))
            ) {
              await this.context.drawAndSwap(
                arr,
                l,
                i,
                options.parallel ? drawIteration : undefined,
              );
            }
          });
        }

        await runFunctions(fns, options.parallel);
        drawIteration++;
      }
    }
  }

  public async bitonicSort(arr: SortValue[], options: AlgorithmOptions) {
    switch (options.type) {
      case 'iterative':
        return await this.iterBitonicSort(arr, options);
      case 'recursive':
        return await this.recBitonicSort(
          arr,
          0,
          this.context.columnNbr,
          'asc',
          options,
        );
    }
  }

  private async recBitonicSort(
    arr: SortValue[],
    start: number,
    end: number,
    direction: 'asc' | 'desc',
    options: AlgorithmOptions,
    drawIteration = 0,
  ) {
    if (end - start <= 1) return;

    const mid = Math.floor((start + end) / 2);
    const sorts = [
      () =>
        this.recBitonicSort(arr, start, mid, 'asc', options, drawIteration + 1),
      () =>
        this.recBitonicSort(arr, mid, end, 'desc', options, drawIteration + 1),
    ];

    await runFunctions(sorts, options.parallel);

    await this.bitonicMerge(arr, start, end, direction, options, drawIteration);
  }

  // Draw iteration highlighting does not work properly, since a swapTime > 0
  // introduces desyncs, where some recursive branches have few swaps while
  // others have many. This causes drawIteration to differ in the draw steps,
  // leading to flickering.
  private async bitonicMerge(
    arr: SortValue[],
    start: number,
    end: number,
    direction: 'asc' | 'desc',
    options: AlgorithmOptions,
    drawIteration: number,
  ) {
    if (end - start <= 1) return;

    const mid = Math.floor((start + end) / 2);
    const j = Math.floor((end - start) / 2);

    const fns = [];
    for (let i = start; i < mid && i + j < arr.length; i++) {
      fns.push(async () => {
        if (
          direction === 'asc' &&
          (await this.context.compare(
            arr,
            i,
            '>',
            i + j,
            options.parallel ? drawIteration + 0.5 : undefined,
          ))
        ) {
          await this.context.drawAndSwap(
            arr,
            i,
            i + j,
            options.parallel ? drawIteration : undefined,
          );
        }
        if (
          direction === 'desc' &&
          (await this.context.compare(
            arr,
            i,
            '<',
            i + j,
            options.parallel ? drawIteration + 0.5 : undefined,
          ))
        ) {
          await this.context.drawAndSwap(
            arr,
            i,
            i + j,
            options.parallel ? drawIteration : undefined,
          );
        }
      });
    }

    await runFunctions(fns, options.parallel);

    const merges = [
      () =>
        this.bitonicMerge(
          arr,
          start,
          mid,
          direction,
          options,
          drawIteration + 1,
        ),
      () =>
        this.bitonicMerge(arr, mid, end, direction, options, drawIteration + 1),
    ];

    await runFunctions(merges, options.parallel);
  }

  // Elmayo's brain child
  public async bullySort(arr: SortValue[]) {
    let isSorted = false;
    let sortedFrom = arr.length;
    while (!isSorted) {
      isSorted = true;
      let swapIndex = 0;
      const maxI = sortedFrom;
      for (let i = 1; i < maxI; i++) {
        if (
          (await this.context.compare(arr, i - 1, '<=', i)) ||
          (i + 1 < arr.length &&
            (await this.context.compare(arr, i + 1, '<', i)))
        ) {
          // Not bullied
          continue;
        }

        sortedFrom = Math.min(i + 2, arr.length);

        // Find smallest bully
        let smallestIndex = i - 1;
        if (
          i + 1 < arr.length &&
          (await this.context.compare(arr, i + 1, '<', smallestIndex))
        ) {
          smallestIndex = i + 1;
        }

        // Find non-bullyable to swap with
        for (let j = swapIndex; j < i; j++) {
          if (await this.context.compare(arr, smallestIndex, '>', j)) {
            continue;
          }

          await this.context.drawAndSwap(arr, j, i);
          isSorted = false;
          swapIndex = j + 1;
          break;
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
            await this.context.drawAndSwap(arr, swapIndex, i);
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
        await this.context.drawAndSwap(arr, start, end);
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
        await this.context.drawAndSwap(arr, i, j);
        await sleep(this.state.swapTime);
      }
    }
  }
  */
  //#endregion

  public async quickSort(arr: SortValue[]) {
    await this._quickSort(arr, 0, this.context.columnNbr - 1);
  }

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

  public async shellSort(arr: SortValue[]) {
    const gaps = [701, 301, 132, 57, 23, 10, 4, 1]; // from https://oeis.org/A102549
    for (const gap of gaps) {
      if (gap > this.context.columnNbr) continue;
      for (let i = gap; i < this.context.columnNbr; i++) {
        for (let j = i; j >= gap; j -= gap) {
          if (await this.context.compare(arr, j - gap, '<', j)) {
            break;
          }
          await this.context.drawAndSwap(arr, j - gap, j);
        }
      }
    }
  }

  public async averageSort(arr: SortValue[]) {
    await this._averageSort(arr, 0, this.context.columnNbr);
  }

  public async _averageSort(arr: SortValue[], start: number, end: number) {
    if (end - start <= 1) return;

    let isUniform = true;
    for (let i = start; i < end; i++) {
      if (await this.context.compare(arr, start, '!=', i)) {
        isUniform = false;
        break;
      }
    }
    if (isUniform) {
      return;
    }

    let sum = 0;
    for (let i = start; i < end; i++) {
      // for highlighting
      // TODO: replace
      await this.context.registerAuxWrite(arr, i);
      sum += arr[i].value;
    }
    const avg = sum / (end - start);

    // Pick mid as the first index where arr[mid] >= avg
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

  public async heapsort(arr: SortValue[], options: AlgorithmOptions) {
    switch (options.heapType) {
      case 'min':
        return await this.minHeapsort(arr, options.childCount);
      case 'max':
        return await this.maxHeapsort(arr, options.childCount);
    }
  }

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

  public async pushSort(arr: SortValue[]) {
    let isSorted = false;
    let lastIndex = arr.length - 1;

    while (!isSorted) {
      isSorted = true;
      let stackSize = 0;
      const end = lastIndex;

      for (let i = 0; i < end; i++) {
        if (await this.context.compare(arr, i, '>', i + 1)) {
          lastIndex = i;
          isSorted = false;
          await this.context.drawAndSwap(arr, i, i + 1);
          for (let j = i; j > i - stackSize; j--) {
            await this.context.drawAndSwap(arr, j - 1, j);
          }
        } else {
          stackSize++;
        }
      }
    }
  }
}
