import {
  FormControl,
  Typography,
  MenuItem,
  Grid2,
  TextField,
} from '@mui/material';
import { AlgorithmOptions, SortName } from './types';
import { useCallback, useState } from 'react';
import { LabeledCheckbox } from './components/LabeledCheckbox';

const getAlgorithmOptionFields = (
  sortName: SortName,
): (keyof AlgorithmOptions)[] => {
  switch (sortName) {
    case SortName.BitonicSort:
    case SortName.OddEvenMergesort:
      return ['type', 'parallel'];
    case SortName.OddEvenSort:
      return ['parallel'];
    case SortName.RadixSortLSD:
    case SortName.RadixSortMSD:
      return ['base'];
    case SortName.CombSort:
      return ['shrinkFactor'];
    case SortName.Heapsort:
      return ['heapType'];
    default:
      return [];
  }
};

const isValidOption = (
  field: keyof AlgorithmOptions,
  value: unknown,
): value is AlgorithmOptions[typeof field] => {
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
  heapType: 'Heap Type',
  parallel: 'Run in parallel',
};

const ALGORITHM_OPTION_TEXT_FIELD_TYPES: Record<
  keyof AlgorithmOptions,
  string
> = {
  type: 'select',
  base: 'number',
  shrinkFactor: 'number',
  heapType: 'select',
  parallel: 'checkbox',
};

const ALGORITHM_OPTION_VALUES: Record<
  keyof AlgorithmOptions,
  AlgorithmOptions['type' | 'heapType'][]
> = {
  type: ['iterative', 'recursive'],
  base: [],
  shrinkFactor: [],
  heapType: ['max', 'min'],
  parallel: [],
};

const ALGORITHM_OPTION_VALUE_LABELS: Record<
  AlgorithmOptions['type' | 'heapType'],
  string
> = {
  iterative: 'Iterative',
  recursive: 'Recursive',
  max: 'Max Heap',
  min: 'Min Heap',
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
    (field: keyof AlgorithmOptions, value: unknown) => {
      setNonValidatedOptions({
        ...nonValidatedOptions,
        [field]: value,
      });

      if (isValidOption(field, value)) {
        setAlgorithmOption(field, value);
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
      <Typography
        align="left"
        variant="subtitle1"
        color="textSecondary"
        gutterBottom
      >
        Options
      </Typography>
      <Grid2 container>
        {algorithmOptionFields.map((field) => (
          <OptionField
            key={field}
            field={field}
            nonValidatedOptions={nonValidatedOptions}
            handleOptionChange={handleOptionChange}
          />
        ))}
      </Grid2>
    </div>
  );
}

const OptionField = (props: {
  field: keyof AlgorithmOptions;
  nonValidatedOptions: AlgorithmOptions;
  handleOptionChange: (field: keyof AlgorithmOptions, value: unknown) => void;
}) => {
  const { field, nonValidatedOptions, handleOptionChange } = props;
  switch (ALGORITHM_OPTION_TEXT_FIELD_TYPES[field]) {
    case 'checkbox':
      return (
        <FormControl key={field} component="fieldset">
          <LabeledCheckbox
            label={ALGORITHM_OPTION_LABELS[field]}
            checked={Boolean(nonValidatedOptions[field])}
            onChecked={(checked) => handleOptionChange(field, checked)}
          />
        </FormControl>
      );
    default:
      return (
        <FormControl component="fieldset">
          <TextField
            key={field}
            select={ALGORITHM_OPTION_TEXT_FIELD_TYPES[field] === 'select'}
            label={ALGORITHM_OPTION_LABELS[field]}
            value={nonValidatedOptions[field]}
            onChange={(event) => handleOptionChange(field, event.target.value)}
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
                <Typography align="left" variant="body2" color="textSecondary">
                  {ALGORITHM_OPTION_VALUE_LABELS[v] ?? v}
                </Typography>
              </MenuItem>
            ))}
          </TextField>
        </FormControl>
      );
  }
};
