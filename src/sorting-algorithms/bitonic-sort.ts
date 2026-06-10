import { AlgorithmOptions, SortValue } from '../types';
import { runFunctions } from '../utils';
import { SortingAlgorithm } from './sorting-algorithm';

export class BitonicSort extends SortingAlgorithm {
  public sort = async (arr: SortValue[], options: AlgorithmOptions) => {
    switch (options.type) {
      case 'iterative':
        return await this.iterBitonicSort(arr, options);
      case 'recursive':
        return await this.recBitonicSort(arr, 0, arr.length, 'asc', options);
    }
  };

  private async iterBitonicSort(arr: SortValue[], options: AlgorithmOptions) {
    let drawIteration = 0;
    for (let k = 2; k <= arr.length; k *= 2) {
      for (let j = k / 2; j > 0; j = Math.floor(j / 2)) {
        const fns = [];
        for (let i = 0; i < arr.length - j; i++) {
          if (i & j) {
            continue;
          }
          fns.push(async () => {
            const l = i + j;
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

  // Draw iteration highlighting does not work properly, since a swapTime > 0
  // introduces desyncs, where some recursive branches have few swaps while
  // others have many. This causes drawIteration to differ in the draw steps,
  // leading to flickering.
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
}
