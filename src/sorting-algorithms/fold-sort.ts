import { AlgorithmOptions, SortValue } from '../types';
import { runFunctions } from '../utils';
import { SortingAlgorithm } from './sorting-algorithm';

export class FoldSort extends SortingAlgorithm {
  public sort = async (arr: SortValue[], options: AlgorithmOptions) => {
    let drawIteration = 0;
    for (
      let m = 2 ** (Math.floor(Math.log2(arr.length)) - 1);
      m > 0;
      m = Math.floor(m / 2)
    ) {
      for (
        let k = 2 ** (Math.floor(Math.log2(arr.length)) - 1);
        k >= Math.floor((m + 1) / 2);
        k = Math.floor(k / 2)
      ) {
        const fns = [];

        for (let j = k; j < arr.length; j += 2 * k) {
          for (let i = 0; i < k && j + i < arr.length; i++) {
            fns.push(async () => {
              if (
                await this.context.compare(
                  arr,
                  j - 1 - i,
                  '>',
                  j + i,
                  options.parallel ? drawIteration : undefined,
                )
              ) {
                await this.context.drawAndSwap(arr, j - 1 - i, j + i);
              }
            });
          }
        }
        await runFunctions(fns, options.parallel);
        drawIteration++;
      }
    }
  };
}
