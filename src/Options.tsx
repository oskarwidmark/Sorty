import {
  FormControl,
  Typography,
  MenuItem,
  Grid2,
  TextField,
} from '@mui/material';
import { AlgorithmOptions, SortName } from './types';
import { useCallback, useState } from 'react';

const getAlgorithmOptionFields = (
  sortName: SortName,
): (keyof AlgorithmOptions)[] => {
  switch (sortName) {
    case SortName.BitonicSort:
    case SortName.OddEvenMergesort:
      return ['type'];
    case SortName.RadixSortLSD:
    case SortName.RadixSortMSD:
      return ['base'];
    case SortName.CombSort:
      return ['shrinkFactor'];
    default:
      return [];
  }
};

const isValidOption = (field: keyof AlgorithmOptions, value: unknown) => {
  switch (field) {
    case 'base':
      return Number(value) >= 2 && Number.isInteger(Number(value));
    case 'shrinkFactor':
      return Number(value) > 1;
    default:
      return true;
  }
};

const ALGORITHM_OPTION_LABELS: Record<keyof AlgorithmOptions, string> = {
  type: 'Type',
  base: 'Base',
  shrinkFactor: 'Shrink Factor',
};

const ALGORITHM_OPTION_TEXT_FIELD_TYPES: Record<
  keyof AlgorithmOptions,
  string
> = {
  type: 'select',
  base: 'number',
  shrinkFactor: 'number',
};

const ALGORITHM_OPTION_VALUES: Record<
  keyof AlgorithmOptions,
  AlgorithmOptions[keyof AlgorithmOptions][]
> = {
  type: ['iterative', 'recursive'],
  base: [],
  shrinkFactor: [],
};

const ALGORITHM_OPTION_VALUE_LABELS: Record<
  AlgorithmOptions[keyof AlgorithmOptions],
  string
> = {
  iterative: 'Iterative',
  recursive: 'Recursive',
};

interface OptionsProps {
  chosenSortAlg: SortName;
  algorithmOptions: AlgorithmOptions;
  setAlgorithmOption: (
    key: keyof AlgorithmOptions,
    value: AlgorithmOptions[typeof key],
  ) => void;
}

export function Options({
  chosenSortAlg,
  algorithmOptions,
  setAlgorithmOption,
}: OptionsProps): React.ReactElement | null {
  const [nonValidatedOptions, setNonValidatedOptions] =
    useState<AlgorithmOptions>({ ...algorithmOptions });

  const handleOptionChange = useCallback(
    (
      field: keyof AlgorithmOptions,
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setNonValidatedOptions({
        ...nonValidatedOptions,
        [field]: event.target.value,
      });

      if (isValidOption(field, event.target.value)) {
        setAlgorithmOption(
          field,
          event.target.value as AlgorithmOptions[typeof field],
        );
      }
    },
    [nonValidatedOptions, setAlgorithmOption],
  );

  const algorithmOptionFields = getAlgorithmOptionFields(chosenSortAlg);
  if (algorithmOptionFields.length === 0) {
    return null;
  }

  return (
    <div>
      <Typography align="left" variant="h6" color="textSecondary" gutterBottom>
        Options
      </Typography>
      <Grid2 container spacing={2}>
        {algorithmOptionFields.map((field) => (
          <FormControl component="fieldset">
            <TextField
              select={ALGORITHM_OPTION_TEXT_FIELD_TYPES[field] === 'select'}
              label={ALGORITHM_OPTION_LABELS[field]}
              value={nonValidatedOptions[field]}
              onChange={(event) => handleOptionChange(field, event)}
              error={!isValidOption(field, nonValidatedOptions[field])}
              size="small"
              sx={{ width: 120 }}
              type={
                ALGORITHM_OPTION_TEXT_FIELD_TYPES[field] === 'select'
                  ? undefined
                  : ALGORITHM_OPTION_TEXT_FIELD_TYPES[field]
              }
            >
              {Object.values(ALGORITHM_OPTION_VALUES[field]).map((v) => (
                <MenuItem key={v} value={v}>
                  <Typography
                    align="left"
                    variant="body1"
                    color="textSecondary"
                  >
                    {ALGORITHM_OPTION_VALUE_LABELS[v] ?? v}
                  </Typography>
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
        ))}
      </Grid2>
    </div>
  );
}
