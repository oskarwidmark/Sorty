import { TextField } from '@mui/material';

type Props = {
  label: string;
  color: string;
  setColor: (color: string) => void;
};

export const ColorField = ({ label, color, setColor }: Props) => (
  <TextField
    label={label}
    value={color}
    type="color"
    size="small"
    sx={{ width: 100 }}
    onChange={(e) => setColor(e.target.value)}
  />
);
