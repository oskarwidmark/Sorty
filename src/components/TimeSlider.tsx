import { inverseTimeScale, timeScale } from '../utils';
import { TitledSlider } from './TitledSlider';

export function TimeSlider(props: {
  title: string;
  time: number;
  changeTime: (value: number) => void;
}) {
  const { title, time, changeTime } = props;

  return (
    <TitledSlider
      title={title}
      defaultValue={inverseTimeScale(time)}
      valueLabelDisplay="auto"
      min={0}
      step={0.1}
      max={14}
      scale={(x) => timeScale(x)}
      onChangeCommitted={(_, value) => changeTime(timeScale(value as number))}
      valueLabelFormat={(value: number) => `${value} ms`}
    />
  );
}
