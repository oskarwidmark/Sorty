import { useEffect } from 'react';
import { AlgorithmOptions, SortName } from './types';
import { TitledSlider } from './components/TitledSlider';

const POWERS_OF_TWO = [8, 16, 32, 64, 128, 256, 512, 1024];
const POWERS_OF_TWO_MARKS = POWERS_OF_TWO.map((value) => ({
  value,
}));

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
      algorithmOptions.type === 'recursive') ||
    chosenSortAlg === SortName.FoldSort;

  useEffect(() => {
    if (requiresPowerOfTwoColumns) {
      changeColumnNbr(undefined, 2 ** Math.floor(Math.log2(columnNbr)));
    }
  }, [requiresPowerOfTwoColumns, changeColumnNbr, columnNbr]);

  return (
    <TitledSlider
      title="# Columns"
      defaultValue={columnNbr}
      valueLabelDisplay="auto"
      min={8}
      max={1024}
      step={requiresPowerOfTwoColumns ? null : 1}
      marks={requiresPowerOfTwoColumns ? POWERS_OF_TWO_MARKS : false}
      onChangeCommitted={changeColumnNbr}
    />
  );
}
