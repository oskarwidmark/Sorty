import { useEffect } from 'react';
import { AlgorithmOptions, SortName, VisualizationType } from './types';
import { TitledSlider } from './components/TitledSlider';

const toMarks = (arr?: number[]) =>
  arr?.map((value) => ({
    value,
  }));
const POWERS_OF_TWO = [8, 16, 32, 64, 128, 256, 512, 1024];
// 3 to 32 => 9 to 1024
const SQUARES = Array(30)
  .fill(0)
  .map((_, i) => (i + 3) ** 2);
const SQUARE_POWERS_OF_TWO = [16, 64, 256, 1024];

export function ColumnSlider(props: {
  columnNbr: number;
  chosenSortAlg: SortName;
  algorithmOptions: AlgorithmOptions;
  changeColumnNbr: (_: unknown, value: number | number[]) => void;
  visualizationType: VisualizationType;
}) {
  const {
    columnNbr,
    chosenSortAlg,
    algorithmOptions,
    changeColumnNbr,
    visualizationType,
  } = props;

  // Bitonic Sort and recursive Odd-even mergesort requires a power of two
  const requiresPowerOfTwoColumns =
    chosenSortAlg === SortName.BitonicSort ||
    (chosenSortAlg === SortName.OddEvenMergesort &&
      algorithmOptions.type === 'recursive') ||
    chosenSortAlg === SortName.FoldSort;
  const requiresSquareColumns = visualizationType === VisualizationType.Matrix;

  useEffect(() => {
    let newColumnNbr = columnNbr;
    if (requiresPowerOfTwoColumns) {
      newColumnNbr = 2 ** Math.floor(Math.log2(newColumnNbr));
    }
    if (requiresSquareColumns) {
      newColumnNbr = Math.floor(Math.sqrt(newColumnNbr)) ** 2;
    }
    changeColumnNbr(undefined, newColumnNbr);
  }, [
    requiresPowerOfTwoColumns,
    changeColumnNbr,
    columnNbr,
    requiresSquareColumns,
  ]);

  const elements =
    requiresPowerOfTwoColumns && requiresSquareColumns
      ? SQUARE_POWERS_OF_TWO
      : requiresPowerOfTwoColumns
      ? POWERS_OF_TWO
      : requiresSquareColumns
      ? SQUARES
      : undefined;

  return (
    <TitledSlider
      title="# Columns"
      defaultValue={columnNbr}
      valueLabelDisplay="auto"
      min={8}
      max={1024}
      step={requiresPowerOfTwoColumns || requiresSquareColumns ? null : 1}
      marks={toMarks(elements)}
      onChangeCommitted={changeColumnNbr}
    />
  );
}
