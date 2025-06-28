import { Typography, Slider } from '@mui/material';
import { POWERS_OF_TWO } from './constants';
import { useEffect } from 'react';
import { AlgorithmOptions, SortName } from './types';

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
    <div>
      <Typography align="left" variant="h6" color="textSecondary" gutterBottom>
        # Columns
      </Typography>
      <div className="col-slider">
        <Slider
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
      </div>
    </div>
  );
}
