import { AlgorithmOptions, SortValue } from '../types';
import { runFunctions } from '../utils';
import { SortingAlgorithm } from './sorting-algorithm';

export class OddEvenSort extends SortingAlgorithm {
  public sort = async (arr: SortValue[], options: AlgorithmOptions) => {
    let isSorted = false;
    let drawIteration = 0;
    let isOdd = true;
    while (!isSorted) {
      isSorted = true;
      const oddSorts = [];
      for (let i = isOdd ? 1 : 2; i < arr.length; i += 2) {
        oddSorts.push(async () => {
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
        });
      }
      await runFunctions(oddSorts, options.parallel);
      drawIteration++;
      isOdd = !isOdd;
    }
  };
}
