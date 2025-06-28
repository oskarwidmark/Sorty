import {
  SelectChangeEvent,
  FormControl,
  Typography,
  Select,
  MenuItem,
} from '@mui/material';
import { SortName } from './types';

export function SortingAlgorithmSelect(props: {
  chosenSortAlg: SortName;
  chooseSortAlg: (event: SelectChangeEvent<SortName>) => void;
}) {
  const { chosenSortAlg, chooseSortAlg } = props;

  return (
    <div className="select-wrapper">
      <FormControl component="fieldset">
        <Typography
          align="left"
          variant="h6"
          color="textSecondary"
          gutterBottom
        >
          Sorting Algorithm
        </Typography>
        <Select value={chosenSortAlg} onChange={chooseSortAlg} size="small">
          {Object.values(SortName).map((v) => (
            <MenuItem value={v} key={v}>
              <Typography align="left" variant="body1" color="textSecondary">
                {v}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
