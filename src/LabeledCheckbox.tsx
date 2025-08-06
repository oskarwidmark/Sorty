import { FormControlLabel, Checkbox, Typography } from '@mui/material';

type Props = {
  label: string;
  checked: boolean;
  onChecked: (checked: boolean) => void;
};

export const LabeledCheckbox = ({ label, checked, onChecked }: Props) => (
  <FormControlLabel
    control={
      <Checkbox
        checked={checked}
        onChange={(e) => onChecked(!!e.target.checked)}
      />
    }
    label={
      <Typography align="left" variant="subtitle1" color="textSecondary">
        {label}
      </Typography>
    }
  />
);
