import React, { MouseEvent } from 'react';
import './App.css';
import { SelectChangeEvent } from '@mui/material';
import {
  SortValue,
  SortName,
  ResetPreset,
  ResetFunction,
  Operator,
  SortType,
  AlgorithmOptions,
  ColorPreset,
} from './types';
import { SortingAlgorithms } from './sorting-algorithms';
import {
  createArr,
  shuffleArray,
  sleep,
  sortNameToSortType,
  timeScale,
} from './utils';
import { SideDrawer } from './SideDrawer';
import {
  RAINBOW_BACKGROUND_COLOR,
  INIT_STATE,
  INIT_SETTINGS,
} from './constants';
import { SortAppBar } from './AppBar';
import { CanvasController } from './canvas-controller';
import { Colors } from './Colors';
import { ColumnSlider } from './ColumnSlider';
import { Options } from './Options';
import { ResetPresetSelect } from './ResetPresetSelect';
import { SortingAlgorithmSelect } from './SortingAlgorithmSelect';
import { TimeSlider } from './TimeSlider';

type Props = {
  playSound: () => void;
  stopSounds: () => void;
  setSoundPitch: (value: number) => void;
};

class App extends React.Component<Props> {
  private sortingAlgorithms: SortingAlgorithms;
  private resetPresets: Record<ResetPreset, ResetFunction>;
  private arr: SortValue[];
  private nbrOfSwaps: number = 0;
  private nbrOfComparisons: number = 0;
  state: {
    isSorting: boolean;
    areSettingsOpen: boolean;
    canDraw: boolean;
    shouldPlaySound: boolean;
    nbrOfSwaps: number;
    nbrOfComparisons: number;
    settings: {
      chosenSortAlg: SortName;
      columnNbr: number;
      swapTime: number;
      compareTime: number;
      resetPreset: ResetPreset;
      algorithmOptions: AlgorithmOptions;
      colorPreset: ColorPreset;
      columnColor1: string;
      columnColor2: string;
      backgroundColor: string;
      highlightColor: string;
    };
  };
  canvasController: CanvasController;

  constructor(public props: Props) {
    super(props);

    const storedSettings = localStorage.getItem('settings');
    this.state = {
      ...INIT_STATE,
      settings: {
        ...INIT_SETTINGS,
        ...(storedSettings ? JSON.parse(storedSettings) : {}),
      },
    };

    this.sortingAlgorithms = new SortingAlgorithms(
      this.state.settings.columnNbr,
      this.compare,
      this.drawAndSwap,
    );

    this.resetPresets = {
      [ResetPreset.Shuffle]: () => shuffleArray(this.arr),
      [ResetPreset.Sorted]: () => this.arr.sort((a, b) => a.value - b.value),
      [ResetPreset.ReverseSorted]: () =>
        this.arr.sort((a, b) => b.value - a.value),
    };

    this.arr = createArr(this.state.settings.columnNbr);
    this.resetPresets[this.state.settings.resetPreset]();

    const ref = React.createRef<HTMLCanvasElement>();
    this.canvasController = new CanvasController(
      ref as React.RefObject<HTMLCanvasElement>,
      this.state.settings.columnNbr,
      this.state.settings.colorPreset,
      this.state.settings.columnColor1,
      this.state.settings.columnColor2,
      this.state.settings.highlightColor,
    );
  }

  setSettings = (
    settings:
      | Partial<typeof this.state.settings>
      | ((
          prevSettings: typeof this.state.settings,
        ) => Partial<typeof this.state.settings>),
    callback?: () => Promise<void> | void,
  ) => {
    this.setState(
      (prevState: typeof this.state) => {
        const newSettings =
          settings instanceof Function
            ? settings(prevState.settings)
            : settings;
        return {
          ...prevState,
          settings: { ...prevState.settings, ...newSettings },
        };
      },
      async () => {
        await callback?.();
        localStorage.setItem('settings', JSON.stringify(this.state.settings));
      },
    );
  };

  resizeCanvas = () => {
    this.canvasController.resizeCanvas(this.arr);
  };

  componentDidMount() {
    this.canvasController.resizeCanvas(this.arr);
    window.addEventListener('resize', this.resizeCanvas);
  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this.resizeCanvas);
  }

  drawOnCanvas = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!this.canvasController.isDrawing) return;

    const drawData = this.canvasController.getDrawData(event);
    for (const data of drawData) {
      this.arr[data.index].value = data.value;
    }
    this.canvasController.redrawColumns(
      this.arr,
      drawData.map(({ index }) => index),
    );
  };

  resetCounters = () => {
    this.setState({ nbrOfSwaps: 0, nbrOfComparisons: 0 });
    this.nbrOfComparisons = 0;
    this.nbrOfSwaps = 0;
  };

  sort = async (arr: SortValue[]) => {
    if (this.state.isSorting) {
      this.stopSorting();
      return;
    }

    this.nbrOfSwaps = 0;
    this.nbrOfComparisons = 0;
    this.setState(
      { isSorting: true, nbrOfSwaps: 0, nbrOfComparisons: 0 },
      async () => {
        try {
          await this.sortingAlgorithms.getSortingAlgorithm(
            this.state.settings.chosenSortAlg,
          )(arr, this.state.settings.algorithmOptions);
        } catch (e) {
          console.error('Sorting interrupted! Reason: ', e);
        }
        // This is due to React reaching maximum update depth with no sleep time
        this.setState({
          nbrOfSwaps: this.nbrOfSwaps,
          nbrOfComparisons: this.nbrOfComparisons,
        });
        this.stopSorting();
      },
    );
  };

  stopSorting = () => {
    this.setState({
      isSorting: false,
    });
    this.canvasController.stopSorting(this.arr);
    this.props.stopSounds();
  };

  drawAndSwap = async (arr: SortValue[], i1: number, i2: number) => {
    if (!this.state.isSorting) throw Error('isSorting is false!');

    this.swap(arr, i1, i2);
    this.canvasController.redrawColumns(arr, [i1, i2]);
    this.nbrOfSwaps++;
    if (this.state.settings.swapTime) {
      // With a zero swapTime, maximum update depth will be exceeded
      // when updating state too often
      this.setState((prevState: typeof this.state) => ({
        nbrOfSwaps: prevState.nbrOfSwaps + 1,
      }));
      this.canvasController.highlightColumns(arr, [i1, i2]);
      await sleep(this.state.settings.swapTime);
    }
  };

  compare = async (
    arr: SortValue[],
    i1: number,
    operator: Operator,
    i2: number,
  ): Promise<boolean> => {
    if (!this.state.isSorting) throw Error('isSorting is false!');
    this.nbrOfComparisons++;
    if (this.state.settings.compareTime) {
      // With a zero compareTime, maximum update depth will be exceeded
      // when updating state too often
      this.setState((prevState: typeof this.state) => ({
        nbrOfComparisons: prevState.nbrOfComparisons + 1,
      }));
      this.canvasController.highlightColumns(arr, [i1, i2]);
      await sleep(this.state.settings.compareTime);
    }

    if (
      sortNameToSortType[this.state.settings.chosenSortAlg] ===
      SortType.Comparison
    ) {
      this.playSoundForColumn(arr, i1);
    }

    switch (operator) {
      case '<':
        return arr[i1].value < arr[i2].value;
      case '>':
        return arr[i1].value > arr[i2].value;
      case '<=':
        return arr[i1].value <= arr[i2].value;
      case '>=':
        return arr[i1].value >= arr[i2].value;
    }
  };

  public async swap(arr: SortValue[], i1: number, i2: number) {
    if (!this.state.isSorting) throw Error('isSorting is false!');

    if (
      sortNameToSortType[this.state.settings.chosenSortAlg] ===
      SortType.Distribution
    ) {
      this.playSoundForColumn(arr, i1);
    }

    [arr[i1], arr[i2]] = [arr[i2], arr[i1]];
  }

  playSoundForColumn = (arr: SortValue[], i: number) => {
    if (!this.state.shouldPlaySound) return;

    this.props.setSoundPitch(
      (arr[i].value * 7) / this.state.settings.columnNbr + 3,
    );
    this.props.playSound();
  };

  toggleDisplaySettings = () => {
    this.setState({ areSettingsOpen: !this.state.areSettingsOpen });
  };

  closeDisplaySettings = () => {
    this.setState({ areSettingsOpen: false });
  };

  chooseSortAlg = (event: SelectChangeEvent<SortName>) => {
    this.stopSorting();

    this.setSettings({ chosenSortAlg: event.target.value as SortName });
  };

  chooseResetPreset = (event: SelectChangeEvent<ResetPreset>) => {
    this.setSettings({ resetPreset: event.target.value as ResetPreset });
  };

  changeColumnNbr = (_: unknown, value: number | number[]) => {
    const columnNbr = value instanceof Array ? value[0] : value;
    this.sortingAlgorithms.columnNbr = columnNbr;
    this.canvasController.columnNbr = columnNbr;
    this.setSettings({ columnNbr }, () => this.resetAndDraw());
  };

  changeSwapTime = (_: unknown, value: number | number[]) => {
    this.setSettings({
      swapTime: timeScale(value instanceof Array ? value[0] : value),
    });
  };

  changeCompareTime = (_: unknown, value: number | number[]) => {
    this.setSettings({
      compareTime: timeScale(value instanceof Array ? value[0] : value),
    });
  };

  resetAndDraw = () => {
    this.stopSorting();
    this.resetCounters();
    this.arr = createArr(this.state.settings.columnNbr);
    this.resetPresets[this.state.settings.resetPreset]();
    this.canvasController.redraw(this.arr);
  };

  shuffleAndDraw = () => {
    this.stopSorting();
    this.resetCounters();

    shuffleArray(this.arr);

    this.canvasController.redraw(this.arr);
  };

  startDrawOnCanvas = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!this.state.canDraw) return;

    this.stopSorting();
    this.canvasController.isDrawing = true;
    this.drawOnCanvas(event);
  };

  endDrawOnCanvas = () => {
    this.canvasController.isDrawing = false;
    this.canvasController.prevDrawIndex = null;
    this.canvasController.prevDrawHeight = null;
  };

  toggleCanDraw = () => {
    this.setState({ canDraw: !this.state.canDraw });
  };

  togglePlaySound = () => {
    this.setState((prevState: typeof this.state) => ({
      shouldPlaySound: !prevState.shouldPlaySound,
    }));
    this.props.stopSounds();
  };

  setAlgorithmOption = (
    key: keyof AlgorithmOptions,
    value: AlgorithmOptions[typeof key],
  ) => {
    this.setSettings((prevSettings) => ({
      algorithmOptions: { ...prevSettings.algorithmOptions, [key]: value },
    }));
  };

  setColorPreset = (colorPreset: ColorPreset) => {
    this.setSettings({ colorPreset });
    this.canvasController.colorPreset = colorPreset;
    this.stopSorting();
    this.canvasController.redraw(this.arr);
  };

  setColumnColor1 = (columnColor1: string) => {
    this.setSettings({ columnColor1 });
    this.canvasController.columnColor1 = columnColor1;
    this.stopSorting();
    this.canvasController.redraw(this.arr);
  };

  setColumnColor2 = (columnColor2: string) => {
    this.setSettings({ columnColor2 });
    this.canvasController.columnColor2 = columnColor2;
    this.stopSorting();
    this.canvasController.redraw(this.arr);
  };

  setBackgroundColor = (backgroundColor: string) => {
    this.setSettings({ backgroundColor });
  };

  setHighlightColor = (highlightColor: string) => {
    this.setSettings({ highlightColor });
    this.canvasController.highlightColor = highlightColor;
    this.stopSorting();
    this.canvasController.redraw(this.arr);
  };

  getBackgroundColor = () => {
    switch (this.state.settings.colorPreset) {
      case ColorPreset.Rainbow:
        return RAINBOW_BACKGROUND_COLOR;
      case ColorPreset.Custom:
      case ColorPreset.CustomGradient:
        return this.state.settings.backgroundColor;
    }
  };

  render() {
    return (
      <div
        className="App"
        style={{ backgroundColor: this.getBackgroundColor() }}
      >
        <div className="App-header">
          <SortAppBar
            arr={this.arr}
            swapTime={this.state.settings.swapTime}
            compareTime={this.state.settings.compareTime}
            canDraw={this.state.canDraw}
            isSorting={this.state.isSorting}
            nbrOfSwaps={this.state.nbrOfSwaps}
            nbrOfComparisons={this.state.nbrOfComparisons}
            sort={this.sort}
            shuffleAndDraw={this.shuffleAndDraw}
            resetAndDraw={this.resetAndDraw}
            toggleCanDraw={this.toggleCanDraw}
            toggleDisplaySettings={this.toggleDisplaySettings}
            shouldPlaySound={this.state.shouldPlaySound}
            togglePlaySound={this.togglePlaySound}
          />
          <div
            className="canvas-wrapper"
            id="canvas-wrapper"
            onClick={this.closeDisplaySettings}
          >
            <canvas
              className="App-canvas"
              ref={this.canvasController.canvasRef}
              onMouseDown={this.startDrawOnCanvas}
              onMouseMove={this.drawOnCanvas}
              onMouseUp={this.endDrawOnCanvas}
              onMouseLeave={this.endDrawOnCanvas}
            />
          </div>
          <SideDrawer
            areSettingsOpen={this.state.areSettingsOpen}
            toggleDisplaySettings={this.toggleDisplaySettings}
          >
            <SortingAlgorithmSelect
              chosenSortAlg={this.state.settings.chosenSortAlg}
              chooseSortAlg={this.chooseSortAlg}
            />
            <Options
              chosenSortAlg={this.state.settings.chosenSortAlg}
              algorithmOptions={this.state.settings.algorithmOptions}
              setAlgorithmOption={this.setAlgorithmOption}
            />
            <ColumnSlider
              columnNbr={this.state.settings.columnNbr}
              chosenSortAlg={this.state.settings.chosenSortAlg}
              algorithmOptions={this.state.settings.algorithmOptions}
              changeColumnNbr={this.changeColumnNbr}
            />
            <TimeSlider
              title="Time per swap (ms)"
              time={this.state.settings.swapTime}
              changeTime={this.changeSwapTime}
            />
            <TimeSlider
              title="Time per comparison (ms)"
              time={this.state.settings.compareTime}
              changeTime={this.changeCompareTime}
            />
            <ResetPresetSelect
              resetPreset={this.state.settings.resetPreset}
              chooseResetPreset={this.chooseResetPreset}
            />
            <Colors
              colorPreset={this.state.settings.colorPreset}
              columnColor1={this.state.settings.columnColor1}
              columnColor2={this.state.settings.columnColor2}
              backgroundColor={this.state.settings.backgroundColor}
              highlightColor={this.state.settings.highlightColor}
              setColorPreset={this.setColorPreset}
              setColumnColor1={this.setColumnColor1}
              setColumnColor2={this.setColumnColor2}
              setBackgroundColor={this.setBackgroundColor}
              setHighlightColor={this.setHighlightColor}
            />
          </SideDrawer>
        </div>
      </div>
    );
  }
}

export default App;
