import { inverseTimeScale, timeScale } from './utils';
import { TitledSlider } from './TitledSlider';

export function TimeSlider(props: {
  title: string;
  time: number;
  changeTime: (_: unknown, value: number | number[]) => void;
}) {
  const { title, time, changeTime } = props;

  return (
    <TitledSlider
      title={title}
      defaultValue={inverseTimeScale(time)}
      aria-labelledby="discrete-slider"
      valueLabelDisplay="auto"
      min={0}
      step={0.1}
      max={10}
      scale={(x) => timeScale(x)}
      onChangeCommitted={changeTime}
      valueLabelFormat={(value: number) => `${value} ms`}
    />
  );
}
