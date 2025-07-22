import { SortName, SortType, SortValue } from './types';

export function hsvToRgbHex(h: number, s: number, v: number) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round((v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)) * 255);
  };

  return (
    '#' +
    [f(5), f(3), f(1)].map((x) => x.toString(16).padStart(2, '0')).join('')
  );
}

export function rgbHexToHsv(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const v = Math.max(r, g, b);
  const c = v - Math.min(r, g, b);
  // ?
  const h =
    c && (v == r ? (g - b) / c : v == g ? 2 + (b - r) / c : 4 + (r - g) / c);
  return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
}

export function shuffleArray(arr: unknown[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export const createArr = (columnNbr: number): SortValue[] =>
  [...Array(columnNbr).keys()].map((a, idx) => {
    return { value: a, id: idx };
  });

export const timeScale = (x: number) => Math.round(2 ** x) - 1;
export const inverseTimeScale = (x: number) => Math.log2(x + 1);

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const sortNameToSortType: Record<SortName, string> = {
  [SortName.InsertionSort]: SortType.Comparison,
  [SortName.SelectionSort]: SortType.Comparison,
  [SortName.CocktailShakerSort]: SortType.Comparison,
  [SortName.BubbleSort]: SortType.Comparison,
  [SortName.OddEvenSort]: SortType.Comparison,
  [SortName.OddEvenMergesort]: SortType.Comparison,
  [SortName.RadixSortLSD]: SortType.Distribution,
  [SortName.RadixSortMSD]: SortType.Distribution,
  [SortName.QuickSort]: SortType.Comparison,
  [SortName.CombSort]: SortType.Comparison,
  [SortName.ShellSort]: SortType.Comparison,
  [SortName.BitonicSort]: SortType.Comparison,
  [SortName.BullySort]: SortType.Comparison,
};

// something that sounds good
export const toHz = (value: number, columnNbr: number) => {
  return (440 * value) / columnNbr + 200;
};
