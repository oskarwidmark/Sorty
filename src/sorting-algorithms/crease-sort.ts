import { AlgorithmOptions, SortValue } from '../types';
import { runFunctions } from '../utils';
import { SortingAlgorithm } from './sorting-algorithm';

export class CreaseSort extends SortingAlgorithm {
  public sort = async (arr: SortValue[], options: AlgorithmOptions) => {
    let drawIteration = 0;
    for (
      let k = 2 ** Math.floor(Math.log2(arr.length - 1));
      k > 0;
      k = Math.floor(k / 2)
    ) {
      const fns = [];
      for (let i = 1; i < arr.length; i += 2) {
        fns.push(async () => {
          if (
            await this.context.compare(
              arr,
              i - 1,
              '>',
              i,
              options.parallel ? drawIteration : undefined,
            )
          ) {
            await this.context.drawAndSwap(arr, i - 1, i);
          }
        });
      }

      await runFunctions(fns, options.parallel);
      drawIteration++;

      for (
        let j = 2 ** Math.floor(Math.log2(arr.length - 1));
        j >= k && j > 1;
        j = Math.floor(j / 2)
      ) {
        const fns = [];
        for (let i = j; i < arr.length; i += 2) {
          fns.push(async () => {
            if (
              await this.context.compare(
                arr,
                i - j + 1,
                '>',
                i,
                options.parallel ? drawIteration : undefined,
              )
            ) {
              await this.context.drawAndSwap(arr, i - j + 1, i);
            }
          });
        }

        await runFunctions(fns, options.parallel);
        drawIteration++;
      }
    }
  };
}
