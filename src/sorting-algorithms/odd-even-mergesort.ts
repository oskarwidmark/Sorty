import { AlgorithmOptions, SortValue } from '../types';
import { runFunctions } from '../utils';
import { SortingAlgorithm } from './sorting-algorithm';

export class OddEvenMergesort extends SortingAlgorithm {
  public sort = async (arr: SortValue[], options: AlgorithmOptions) => {
    switch (options.type) {
      case 'iterative':
        return await this.iterOddEvenMergesort(arr, options);
      case 'recursive':
        return await this.recOddEvenMergesort(arr, 0, arr.length, options);
    }
  };

  private async iterOddEvenMergesort(
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
      () =>
        this.oddEvenMerge(arr, start, end, newDist, options, drawIteration + 1),
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
}
