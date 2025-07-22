import { Typography, Slider } from '@mui/material';
import { inverseTimeScale, timeScale } from './utils';

export function TimeSlider(props: {
  title: string;
  time: number;
  changeTime: (_: unknown, value: number | number[]) => void;
}) {
  const { title, time, changeTime } = props;

  return (
    <div>
      <Typography align="left" variant="subtitle1" color="textSecondary">
        {title}
      </Typography>
      <div className="col-slider">
        <Slider
          defaultValue={inverseTimeScale(time)}
          aria-labelledby="discrete-slider"
          valueLabelDisplay="auto"
          min={0}
          step={0.1}
          max={10}
          scale={(x) => timeScale(x)}
          onChangeCommitted={changeTime}
        />
      </div>
    </div>
  );
}
