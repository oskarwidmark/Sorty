import { Slider, Typography } from '@mui/material';

export const TitledSlider = ({
  title,
  ...props
}: { title: string } & React.ComponentProps<typeof Slider>) => (
  <div>
    <Typography align="left" variant="subtitle1" color="textSecondary">
      {title}
    </Typography>
    <div className="col-slider">
      <Slider
        {...props}
        sx={{ '& .MuiSlider-thumb': { width: '10px', borderRadius: '10%' } }}
      />
    </div>
  </div>
);
