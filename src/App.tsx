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
  INIT_COLUMN_NUMBER,
  INIT_SWAP_TIME,
  INIT_COMPARE_TIME,
} from './constants';
import { SortAppBar } from './AppBar';
import { CanvasController } from './canvas-controller';

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
    chosenSortAlg: SortName;
    columnNbr: number;
    compareTime: number;
    swapTime: number;
    canDraw: boolean;
    nbrOfSwaps: number;
    nbrOfComparisons: number;
    resetPreset: ResetPreset;
    shouldHighlightSwaps: boolean;
    shouldHighlightComparisons: boolean;
    shouldPlaySound: boolean;
  };
  canvasController: CanvasController;

  constructor(public props: Props) {
    super(props);

    this.sortingAlgorithms = new SortingAlgorithms(
      INIT_COLUMN_NUMBER,
      this.compare,
      this.drawAndSwap,
    );

    this.arr = createArr(INIT_COLUMN_NUMBER);
    shuffleArray(this.arr);
    this.state = {
      isSorting: false,
      areSettingsOpen: false,
      chosenSortAlg: SortName.InsertionSort,
      columnNbr: INIT_COLUMN_NUMBER,
      swapTime: INIT_SWAP_TIME,
      compareTime: INIT_COMPARE_TIME,
      canDraw: false,
      nbrOfSwaps: 0,
      nbrOfComparisons: 0,
      resetPreset: ResetPreset.Shuffle,
      shouldHighlightSwaps: true,
      shouldHighlightComparisons: false,
      shouldPlaySound: false,
    };

    this.resetPresets = {
      [ResetPreset.Shuffle]: () => shuffleArray(this.arr),
      [ResetPreset.Sorted]: () => this.arr.sort((a, b) => a.value - b.value),
      [ResetPreset.ReverseSorted]: () =>
        this.arr.sort((a, b) => b.value - a.value),
    };

    const ref = React.createRef<HTMLCanvasElement>();
    this.canvasController = new CanvasController(
      ref as React.RefObject<HTMLCanvasElement>,
      INIT_COLUMN_NUMBER,
    );
  }

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
            this.state.chosenSortAlg,
          )(arr);
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
    if (this.state.swapTime) {
      // With a zero swapTime, maximum update depth will be exceeded
      // when updating state too often
      this.setState((prevState: typeof this.state) => ({
        nbrOfSwaps: prevState.nbrOfSwaps + 1,
      }));
      this.canvasController.highlightColumns(arr, [i1, i2]);
      await sleep(this.state.swapTime);
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
    if (this.state.compareTime) {
      // With a zero compareTime, maximum update depth will be exceeded
      // when updating state too often
      this.setState((prevState: typeof this.state) => ({
        nbrOfComparisons: prevState.nbrOfComparisons + 1,
      }));
      this.canvasController.highlightColumns(arr, [i1, i2]);
      await sleep(this.state.compareTime);
    }

    if (sortNameToSortType[this.state.chosenSortAlg] === SortType.Comparison) {
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
      sortNameToSortType[this.state.chosenSortAlg] === SortType.Distribution
    ) {
      this.playSoundForColumn(arr, i1);
    }

    [arr[i1], arr[i2]] = [arr[i2], arr[i1]];
  }

  playSoundForColumn = (arr: SortValue[], i: number) => {
    if (!this.state.shouldPlaySound) return;

    this.props.setSoundPitch((arr[i].value * 7) / this.state.columnNbr + 3);
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

    this.setState({ chosenSortAlg: event.target.value });
  };

  chooseResetPreset = (event: SelectChangeEvent<ResetPreset>) => {
    this.setState({ resetPreset: event.target.value });
  };

  changeColumnNbr = (_: unknown, value: number | number[]) => {
    const columnNbr = value instanceof Array ? value[0] : value;
    this.sortingAlgorithms.columnNbr = columnNbr;
    this.canvasController.columnNbr = columnNbr;
    this.setState({ columnNbr }, () => this.resetAndDraw());
  };

  changeSwapTime = (_: unknown, value: number | number[]) => {
    this.setState({
      swapTime: timeScale(value instanceof Array ? value[0] : value),
    });
  };

  changeCompareTime = (_: unknown, value: number | number[]) => {
    this.setState({
      compareTime: timeScale(value instanceof Array ? value[0] : value),
    });
  };

  resetAndDraw = () => {
    this.stopSorting();
    this.resetCounters();
    this.arr = createArr(this.state.columnNbr);
    this.resetPresets[this.state.resetPreset]();
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

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <SortAppBar
            arr={this.arr}
            swapTime={this.state.swapTime}
            compareTime={this.state.compareTime}
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
            resetPreset={this.state.resetPreset}
            chosenSortAlg={this.state.chosenSortAlg}
            toggleDisplaySettings={this.toggleDisplaySettings}
            chooseSortAlg={this.chooseSortAlg}
            chooseResetPreset={this.chooseResetPreset}
            changeColumnNbr={this.changeColumnNbr}
            changeSwapTime={this.changeSwapTime}
            changeCompareTime={this.changeCompareTime}
            columnNbr={this.state.columnNbr}
          />
        </div>
      </div>
    );
  }
}

export default App;
