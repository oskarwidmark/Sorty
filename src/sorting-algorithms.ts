import { Operator, SortAlgorithm, SortName, SortValue } from './types';

export class SortingAlgorithms {
  private sortingAlgorithms: Record<SortName, SortAlgorithm> = {
    [SortName.InsertionSort]: this.insertionSort,
    [SortName.SelectionSort]: this.selectionSort,
    [SortName.CocktailShakerSort]: this.cocktailShakerSort,
    [SortName.BubbleSort]: this.bubbleSort,
    [SortName.OddEvenSort]: this.oddEvenSort,
    [SortName.RadixSortLSD]: this.lsdRadixSort,
    [SortName.RadixSortMSD]: this.msdRadixSort,
    [SortName.QuickSort]: this.quickSort,
    [SortName.CombSort]: this.combSort,
    [SortName.ShellSort]: this.shellSort,
    [SortName.BitonicSort]: this.bitonicSort,
    [SortName.BullySort]: this.bullySort,
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

  public async combSort(arr: SortValue[]) {
    let gap = this._columnNbr;
    const shrinkFactor = 1.3;
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

  public async lsdRadixSort(arr: SortValue[], base = 4) {
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
    base = 4,
    start = 0,
    end = this._columnNbr,
    shift = Math.floor(Math.log(this._columnNbr) / Math.log(base)),
  ) {
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
        await this.drawAndSwap(arr, currentIndex, swapIndex);

        indexMap[arr[swapIndex].id] = indexMap[arr[currentIndex].id];
        currentIndex++;
      }
      if (shift === 0) continue;

      bucketIndices.push([bucketStart, currentIndex]);
    }
    for (const [bucketStart, bucketEnd] of bucketIndices) {
      await this.msdRadixSort(arr, base, bucketStart, bucketEnd, shift - 1);
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
  public async bitonicSort(arr: SortValue[]) {
    for (let k = 2; k <= arr.length; k *= 2) {
      for (let j = k / 2; j > 0; j = Math.floor(j / 2)) {
        for (let i = 0; i < arr.length - j; i++) {
          // When we reach the bit for j, we can skip to the next part,
          // since we already have compared all pairs for this j.
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

  public async quickSort(
    arr: SortValue[],
    start = 0,
    end = this._columnNbr - 1,
  ) {
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

    await this.quickSort(arr, start, i - 1);
    await this.quickSort(arr, i + 1, end);
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
}
