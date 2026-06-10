import { describe, it, expect } from '@jest/globals';
import { SortingAlgorithms } from '.';
import { AlgorithmOptions, SortName } from '../types';
import { compare, getAlgorithmOptionFields } from '../utils';
import { SortingAlgorithm } from './sorting-algorithm';

const testOptionsMap = new Map([
  ['shrinkFactor', [{ shrinkFactor: 1.3 }, { shrinkFactor: 1.5 }]],
  ['base', [{ base: 2 }, { base: 3 }]],
  ['heapType', [{ heapType: 'max' }, { heapType: 'min' }]],
  ['type', [{ type: 'iterative' }, { type: 'recursive' }]],
  ['parallel', [{ parallel: true }, { parallel: false }]],
  ['childCount', [{ childCount: 2 }, { childCount: 4 }]],
]);

describe('Sorting algorithms', () => {
  const sortingAlgorithms = new SortingAlgorithms({
    compare: async (arr, i, operator, j) =>
      compare(arr[i].value, operator, arr[j].value),
    valueCompare: async (arr, i, operator, value) =>
      compare(arr[i].value, operator, value),
    drawAndSwap: async (arr, i, j) => {
      [arr[i], arr[j]] = [arr[j], arr[i]];
    },
    registerAuxWrite: async () => {},
  });
  const unsortedArray = Array.from({ length: 512 }, () =>
    Math.floor(Math.random() * 512),
  );
  const sortedArray = [...unsortedArray].sort((a, b) => a - b);

  const testCases = Object.entries(sortingAlgorithms.sortingAlgorithms).flatMap(
    permuteOptions,
  );

  it.each(testCases)(
    'should sort an array of numbers correctly with $name and options $options',
    async ({ sortAlgorithm, options }) => {
      const arr = unsortedArray.map((value, idx) => ({ value, id: idx }));
      await sortAlgorithm.sort(arr, options);
      const result = arr.map((item) => item.value);
      expect(result).toEqual(sortedArray);
    },
  );
});

function permuteOptions(sortingAlgorithmEntry: [unknown, unknown]) {
  const [name, sortAlgorithm] = sortingAlgorithmEntry as [
    SortName,
    SortingAlgorithm,
  ];

  const optionsArray = getAlgorithmOptionFields(name).map(
    (field) => testOptionsMap.get(field) ?? [],
  );

  if (optionsArray.length == 0) {
    return [
      {
        name,
        sortAlgorithm,
        options: {} as AlgorithmOptions,
      },
    ];
  }

  if (optionsArray.length === 1) {
    return optionsArray[0].map((option) => ({
      name,
      sortAlgorithm,
      options: option as AlgorithmOptions,
    }));
  }

  return optionsArray
    .map((options1, i) =>
      optionsArray.slice(i + 1).map((options2) =>
        options1.map((option1) =>
          options2.map((option2) => ({
            name,
            sortAlgorithm,
            options: { ...option1, ...option2 } as AlgorithmOptions,
          })),
        ),
      ),
    )
    .flat(3);
}
