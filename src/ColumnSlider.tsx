import { POWERS_OF_TWO } from './constants';
import { useEffect } from 'react';
import { AlgorithmOptions, SortName } from './types';
import { TitledSlider } from './TitledSlider';

export function ColumnSlider(props: {
  columnNbr: number;
  chosenSortAlg: SortName;
  algorithmOptions: AlgorithmOptions;
  changeColumnNbr: (_: unknown, value: number | number[]) => void;
}) {
  const { columnNbr, chosenSortAlg, algorithmOptions, changeColumnNbr } = props;

  // Bitonic Sort and recursive Odd-even mergesort requires a power of two
  const requiresPowerOfTwoColumns =
    chosenSortAlg === SortName.BitonicSort ||
    (chosenSortAlg === SortName.OddEvenMergesort &&
      algorithmOptions.type === 'recursive');

  useEffect(() => {
    if (requiresPowerOfTwoColumns) {
      changeColumnNbr(undefined, 2 ** Math.floor(Math.log2(columnNbr)));
    }
  }, [requiresPowerOfTwoColumns, changeColumnNbr, columnNbr]);

  return (
    <TitledSlider
      title="# Columns"
      defaultValue={columnNbr}
      aria-labelledby="discrete-slider"
      valueLabelDisplay="auto"
      min={8}
      max={1024}
      step={requiresPowerOfTwoColumns ? null : 1}
      marks={
        requiresPowerOfTwoColumns
          ? POWERS_OF_TWO.map((value) => ({
              value,
            }))
          : false
      }
      onChangeCommitted={changeColumnNbr}
    />
  );
}
