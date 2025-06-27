import { AlgorithmOptions } from './types';

export const INIT_SWAP_TIME = 1;
export const INIT_COMPARE_TIME = 1;
export const INIT_COLUMN_NUMBER = 100;
export const HIGHLIGHT_COLOR = '#FFFFFF';
export const POWERS_OF_TWO = [8, 16, 32, 64, 128, 256, 512, 1024];
export const DEFAULT_ALGORITHM_OPTIONS: AlgorithmOptions = {
  type: 'iterative',
  base: 4,
  shrinkFactor: 1.3,
};
