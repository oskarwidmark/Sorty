import { FormControl, Typography, Select, MenuItem } from '@mui/material';

export const TitledSelect = ({
  title,
  value,
  onSelect,
  options,
}: {
  title: string;
  value: string;
  onSelect: (value: string) => void;
  options: string[];
}) => {
  return (
    <div className="select-wrapper">
      <FormControl component="fieldset">
        <Typography
          align="left"
          variant="subtitle1"
          color="textSecondary"
          gutterBottom
        >
          {title}
        </Typography>
        <Select
          value={value}
          onChange={(event) => onSelect(event.target.value)}
          size="small"
        >
          {options.map((v) => (
            <MenuItem value={v} key={v}>
              <Typography align="left" variant="body2" color="textSecondary">
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};
