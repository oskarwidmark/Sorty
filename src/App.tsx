import React, { MouseEvent } from 'react';
import './App.css';
import { SelectChangeEvent } from '@mui/material';
import {
  SortValue,
  SortName,
  ResetPreset,
  ResetFunction,
  Operator,
} from './types';
import { SortingAlgorithms } from './sorting-algorithms';
import {
  createArr,
  shuffleArray,
  hsvToRgbHex,
  sleep,
  timeScale,
} from './utils';
import { SideDrawer } from './SideDrawer';
import {
  INIT_COLUMN_NUMBER,
  INIT_SWAP_TIME,
  INIT_COMPARE_TIME,
  HIGHLIGHT_COLOR,
} from './constants';
import { SortAppBar } from './AppBar';

class App extends React.Component {
  private sortingAlgorithms: SortingAlgorithms;
  private resetPresets: Record<ResetPreset, ResetFunction>;
  private arr: SortValue[];
  private canvasRef: React.RefObject<HTMLCanvasElement>;
  private prevHighlightIndices: number[] | null = null;
  private nbrOfSwaps: number = 0;
  private nbrOfComparisons: number = 0;
  state: {
    isSorting: boolean;
    areSettingsOpen: boolean;
    chosenSortAlg: SortName;
    columnNbr: number;
    compareTime: number;
    swapTime: number;
    isDrawing: boolean;
    canDraw: boolean;
    nbrOfSwaps: number;
    nbrOfComparisons: number;
    resetPreset: ResetPreset;
    shouldHighlightSwaps: boolean;
    shouldHighlightComparisons: boolean;
  };
  prevDrawIndex: number | null = null;
  prevDrawHeight: number | null = null;

  constructor(props: object) {
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
      isDrawing: false,
      canDraw: false,
      nbrOfSwaps: 0,
      nbrOfComparisons: 0,
      resetPreset: ResetPreset.Shuffle,
      shouldHighlightSwaps: true,
      shouldHighlightComparisons: false,
    };

    this.resetPresets = {
      [ResetPreset.Shuffle]: () => shuffleArray(this.arr),
      [ResetPreset.Sorted]: () => this.arr.sort((a, b) => a.x - b.x),
      [ResetPreset.ReverseSorted]: () => this.arr.sort((a, b) => b.x - a.x),
    };

    const ref = React.createRef<HTMLCanvasElement>();
    this.canvasRef = ref as React.RefObject<HTMLCanvasElement>;
  }

  componentDidMount() {
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas);
  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this.resizeCanvas);
  }

  resizeCanvas = () => {
    const canvas = this.canvasRef.current;
    const context = canvas?.getContext('2d');

    if (context == null) {
      throw Error('context is null!');
    }

    const parent = document.getElementById('canvas-wrapper');
    if (parent === null) {
      throw Error('parent is null!');
    }

    context.canvas.width = parent.offsetWidth;
    context.canvas.height = parent.offsetHeight;

    this.drawAll(context, this.arr);
  };

  removeHighlight = (arr: SortValue[]) => {
    this.highlight(arr, []);
  };

  highlight = (arr: SortValue[], indices: number[]) => {
    if (!this.state.isSorting) throw Error('isSorting is false!');

    const canvas = this.canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context == null) {
      throw Error('context is null!');
    }

    if (this.prevHighlightIndices) {
      for (const idx of this.prevHighlightIndices) {
        this.drawDiff(arr, idx, idx);
      }
    }
    this.prevHighlightIndices = indices;

    for (const idx of indices) {
      this.clearColumn(context, idx);
      this.drawColumn(context, arr, idx, idx, HIGHLIGHT_COLOR);
    }
  };

  drawDiff = (arr: SortValue[], i1: number, i2: number) => {
    if (!this.state.isSorting) throw Error('isSorting is false!');

    const canvas = this.canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context == null) {
      throw Error('context is null!');
    }

    this.clearColumn(context, i1);
    this.drawColumn(context, arr, i1, i2);
  };

  drawAll = (ctx: CanvasRenderingContext2D, arr: SortValue[]) => {
    for (let i = 0; i < arr.length; i++) {
      this.drawColumn(ctx, arr, i, i);
    }
  };

  clearAll = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  drawColumn = (
    ctx: CanvasRenderingContext2D,
    arr: SortValue[],
    i1: number,
    i2: number,
    color?: string,
  ) => {
    const arrLength = arr.length;
    const width = ctx.canvas.width / this.state.columnNbr;
    const height = (ctx.canvas.height / this.state.columnNbr) * (arr[i2].x + 1);
    const startX = width * i1;

    ctx.fillStyle = color || hsvToRgbHex((360 * arr[i2].x) / arrLength, 1, 1);
    this.fillRect(ctx, startX, 0, width, height);
  };

  fillRect = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    width: number,
    height: number,
  ) => {
    const ctxHeight = ctx.canvas.height;
    ctx.fillRect(
      startX,
      Math.floor(ctxHeight) - Math.floor(startY) - Math.floor(height),
      Math.floor(width),
      Math.floor(height),
    );
  };

  clearColumn = (ctx: CanvasRenderingContext2D, idx: number) => {
    const width = ctx.canvas.width / this.state.columnNbr;
    const startX = width * idx;

    this.clearRect(ctx, startX, width);
  };

  clearRect = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    width: number,
  ) => {
    const ctxHeight = ctx.canvas.height;
    ctx.clearRect(startX - 1, 0, Math.floor(width) + 2, Math.floor(ctxHeight));
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
    if (this.prevHighlightIndices) {
      this.removeHighlight(this.arr);
    }
    this.setState({
      isSorting: false,
    });
    this.prevHighlightIndices = null;
  };

  drawAndSwap = async (arr: SortValue[], i1: number, i2: number) => {
    this.drawDiff(arr, i1, i2);
    this.drawDiff(arr, i2, i1);
    this.swap(arr, i1, i2);
    this.nbrOfSwaps++;
    if (this.state.swapTime) {
      // With a zero swapTime, maximum update depth will be exceeded
      // when updating state too often
      this.setState((prevState: typeof this.state) => ({
        nbrOfSwaps: prevState.nbrOfSwaps + 1,
      }));
      this.highlight(arr, [i1, i2]);
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
      this.highlight(arr, [i1, i2]);
      await sleep(this.state.compareTime);
    }

    switch (operator) {
      case '<':
        return arr[i1].x < arr[i2].x;
      case '>':
        return arr[i1].x > arr[i2].x;
      case '<=':
        return arr[i1].x <= arr[i2].x;
      case '>=':
        return arr[i1].x >= arr[i2].x;
    }
  };

  public async swap(arr: SortValue[], i1: number, i2: number) {
    if (!this.state.isSorting) throw Error('isSorting is false!');
    [arr[i1], arr[i2]] = [arr[i2], arr[i1]];
  }

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
    this.arr = createArr(columnNbr);
    this.sortingAlgorithms.columnNbr = columnNbr;
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

    const canvas = this.canvasRef.current;
    const context = canvas?.getContext('2d');

    if (context == null) {
      throw Error('context is null!');
    }

    this.clearAll(context);
    this.drawAll(context, this.arr);
  };

  shuffleAndDraw = () => {
    this.stopSorting();
    this.resetCounters();

    shuffleArray(this.arr);

    const canvas = this.canvasRef.current;
    const context = canvas?.getContext('2d');

    if (context == null) {
      throw Error('context is null!');
    }

    this.clearAll(context);
    this.drawAll(context, this.arr);
  };

  drawOnCanvas = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!this.state.isDrawing) return;

    const canvas = this.canvasRef.current;
    if (canvas == null) {
      throw Error('canvas is null!');
    }

    const context = canvas.getContext('2d');
    if (context == null) {
      throw Error('context is null!');
    }
    const rect = canvas.getBoundingClientRect();

    const colIndex = Math.floor(
      ((event.clientX - rect.left) / canvas.width) * this.state.columnNbr,
    );
    const colHeight = Math.floor(
      ((canvas.height - (event.clientY - rect.top)) / canvas.height) *
        this.state.columnNbr,
    );

    // If the mouse is moved too fast, we will set the height of the columns in
    // between the previous and current mouse position to match the line
    // between the two points.
    if (this.prevDrawIndex && this.prevDrawHeight) {
      const indexIncr = Math.sign(colIndex - this.prevDrawIndex);
      let curHeight = this.prevDrawHeight;
      for (
        let i = this.prevDrawIndex + indexIncr;
        i !== colIndex;
        i += indexIncr
      ) {
        curHeight +=
          (colHeight - this.prevDrawHeight) /
          Math.abs(colIndex - this.prevDrawIndex);
        this.arr[i].x = Math.round(curHeight);
        this.clearColumn(context, i);
        this.drawColumn(context, this.arr, i, i);
      }
    }

    this.arr[colIndex].x = colHeight;
    this.clearColumn(context, colIndex);
    this.drawColumn(context, this.arr, colIndex, colIndex);
    this.prevDrawIndex = colIndex;
    this.prevDrawHeight = colHeight;
  };

  startDrawOnCanvas = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!this.state.canDraw) return;

    this.stopSorting();
    this.setState({ isDrawing: true }, () => this.drawOnCanvas(event));
  };

  endDrawOnCanvas = () => {
    this.prevDrawIndex = null;
    this.prevDrawHeight = null;
    this.setState({ isDrawing: false });
  };

  toggleCanDraw = () => {
    this.setState({ canDraw: !this.state.canDraw });
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
          />
          <div
            className="canvas-wrapper"
            id="canvas-wrapper"
            onClick={this.closeDisplaySettings}
          >
            <canvas
              className="App-canvas"
              ref={this.canvasRef}
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
          />
        </div>
      </div>
    );
  }
}

export default App;
