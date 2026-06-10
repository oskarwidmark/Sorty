import {
  CompareFn,
  DrawAndSwapFn,
  RegisterAuxWriteFn,
  SortFn,
  ValueCompareFn,
} from '../types';

export abstract class SortingAlgorithm {
  constructor(
    protected context: {
      compare: CompareFn;
      valueCompare: ValueCompareFn;
      drawAndSwap: DrawAndSwapFn;
      registerAuxWrite: RegisterAuxWriteFn;
    },
  ) {}

  abstract sort: SortFn;
}
