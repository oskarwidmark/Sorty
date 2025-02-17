import React, { MouseEvent } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import './App.css';
import { PlayCircle, StopCircle } from '@mui/icons-material';
import { MenuItem, Select, SelectChangeEvent } from '@mui/material';

const INIT_SWAP_TIME = 1;
const INIT_COMPARE_TIME = 1;
const INIT_COLUMN_NUMBER = 100;
const HIGHLIGHT_COLOR = '#FFFFFF';

function shuffleArray(arr: SortValue[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

const timeScale = (x: number) => Math.round(2 ** x) - 1;

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

function hsvToRgbHex(h: number, s: number, v: number) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round((v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)) * 255);
  };

  return (
    '#' +
    [f(5), f(3), f(1)].map((x) => x.toString(16).padStart(2, '0')).join('')
  );
}

const createArr = (columnNbr: number) =>
  [...Array(columnNbr).keys()].map((a, idx) => {
    return { x: a, id: idx };
  });

enum SortName {
  InsertionSort = 'Insertion Sort',
  SelectionSort = 'Selection Sort',
  CocktailShakerSort = 'Cocktail Shaker Sort',
  BubbleSort = 'Bubble Sort',
  RadixSortLSD = 'Radix Sort (LSD)',
  RadixSortMSD = 'Radix Sort (MSD)',
  QuickSort = 'Quick Sort',
  CombSort = 'Comb Sort',
  ShellSort = 'Shell Sort',
  BullySort = 'Bully Sort',
}

type SortAlgorithm = (arr: SortValue[]) => Promise<void>;

type SortValue = { x: number; id: number };

enum ResetPreset {
  Shuffle = 'Shuffle',
  Sorted = 'Sorted',
  ReverseSorted = 'Reverse Sorted',
}

type ResetFunction = () => void;

type Operator = '<' | '>' | '<=' | '>=';

class App extends React.Component {
  private sortingAlgorithms: Record<SortName, SortAlgorithm>;
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
    this.sortingAlgorithms = {
      [SortName.InsertionSort]: this.insertionSort,
      [SortName.SelectionSort]: this.selectionSort,
      [SortName.CocktailShakerSort]: this.cocktailShakerSort,
      [SortName.BubbleSort]: this.bubbleSort,
      [SortName.RadixSortLSD]: this.lsdRadixSort,
      [SortName.RadixSortMSD]: this.msdRadixSort,
      [SortName.QuickSort]: this.quickSort,
      [SortName.CombSort]: this.combSort,
      [SortName.ShellSort]: this.shellSort,
      [SortName.BullySort]: this.bullySort,
      // 'Bully Sort 2': this.bullySort2,
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
          await this.sortingAlgorithms[this.state.chosenSortAlg](arr);
        } catch (e) {
          console.log('Sorting interrupted! Reason: ' + e);
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

  bubbleSort = async (arr: SortValue[]) => {
    let isSorted = false;
    let sortedCount = 0;
    while (!isSorted) {
      isSorted = true;
      for (let i = 1; i < arr.length - sortedCount; i++) {
        if (await this.compare(arr, i - 1, '>', i)) {
          await this.drawAndSwap(arr, i - 1, i);
          isSorted = false;
        }
      }
      sortedCount++;
    }
  };

  combSort = async (arr: SortValue[]) => {
    let gap = this.state.columnNbr;
    const shrinkFactor = 1.3;
    let isSorted = false;
    while (!isSorted) {
      gap = Math.floor(gap / shrinkFactor);
      if (gap <= 1) {
        gap = 1;
        isSorted = true;
      }
      for (let i = gap; i < arr.length; i++) {
        if (await this.compare(arr, i - gap, '>', i)) {
          await this.drawAndSwap(arr, i - gap, i);
          isSorted = false;
        }
      }
    }
  };

  insertionSort = async (arr: SortValue[]) => {
    for (let i = 1; i < arr.length; i++) {
      let j = i;
      while (j > 0 && (await this.compare(arr, j - 1, '>', j))) {
        await this.drawAndSwap(arr, j - 1, j);
        j--;
      }
    }
  };

  lsdRadixSort = async (arr: SortValue[], base = 4) => {
    const buckets = Array(base);
    const indexMap: Record<number, number> = {};
    let shift = 0;
    const isSorted = false;
    while (!isSorted) {
      for (let i = 0; i < base; i++) {
        buckets[i] = [];
      }
      for (let i = 0; i < arr.length; i++) {
        const index = Math.floor(arr[i].x / base ** shift) % base;
        buckets[index].push(arr[i]);
        indexMap[arr[i].id] = i;
      }
      shift++;
      let currentIndex = 0;

      if (buckets[0].length === arr.length) {
        break;
      }

      for (const bucket of buckets) {
        for (const a of bucket) {
          const swapIndex = indexMap[a.id];
          await this.drawAndSwap(arr, currentIndex, swapIndex);

          indexMap[arr[swapIndex].id] = indexMap[arr[currentIndex].id];
          currentIndex++;
        }
      }
    }
  };

  msdRadixSort = async (
    arr: SortValue[],
    base = 4,
    start = 0,
    end = this.state.columnNbr,
    shift = Math.floor(Math.log(this.state.columnNbr) / Math.log(base)),
  ) => {
    const buckets = Array(base);
    const indexMap: Record<number, number> = {};

    if (end - start === 0) return;

    for (let i = 0; i < base; i++) {
      buckets[i] = [];
    }
    for (let i = start; i < end; i++) {
      const index = Math.floor(arr[i].x / base ** shift) % base;
      buckets[index].push(arr[i]);
      indexMap[arr[i].id] = i;
    }

    const bucketIndices = [];

    let currentIndex = start;

    for (const bucket of buckets) {
      const bucketStart = currentIndex;
      for (const a of bucket) {
        const swapIndex = indexMap[a.id];
        await this.drawAndSwap(arr, currentIndex, swapIndex);

        indexMap[arr[swapIndex].id] = indexMap[arr[currentIndex].id];
        currentIndex++;
      }
      if (shift === 0) continue;

      bucketIndices.push([bucketStart, currentIndex]);
    }
    for (const [bucketStart, bucketEnd] of bucketIndices) {
      await this.msdRadixSort(arr, base, bucketStart, bucketEnd, shift - 1);
    }
  };

  selectionSort = async (arr: SortValue[]) => {
    for (let i = 0; i < arr.length; i++) {
      let curJ = i;
      for (let j = i + 1; j < arr.length; j++) {
        if (await this.compare(arr, j, '<', curJ)) {
          curJ = j;
        }
      }
      if (curJ !== i) {
        await this.drawAndSwap(arr, curJ, i);
      }
    }
  };

  cocktailShakerSort = async (arr: SortValue[]) => {
    let isSorted = false;
    let shouldSortReversed = false;
    let sortedCountRight = 0;
    let sortedCountLeft = 0;
    while (!isSorted) {
      isSorted = true;
      if (!shouldSortReversed) {
        for (
          let i = 1 + sortedCountLeft;
          i < arr.length - sortedCountRight;
          i++
        ) {
          if (await this.compare(arr, i - 1, '>', i)) {
            await this.drawAndSwap(arr, i - 1, i);
            isSorted = false;
          }
        }
        sortedCountRight++;
      } else {
        for (
          let i = arr.length - 1 - sortedCountRight;
          i > sortedCountLeft;
          i--
        ) {
          if (await this.compare(arr, i - 1, '>', i)) {
            await this.drawAndSwap(arr, i - 1, i);
            isSorted = false;
          }
        }
        sortedCountLeft++;
      }
      shouldSortReversed = !shouldSortReversed;
    }
  };

  // Elmayo's brain child
  bullySort = async (arr: SortValue[]) => {
    let isSorted = false;
    while (!isSorted) {
      isSorted = true;
      let swapIndex = 0;
      for (let i = 1; i < arr.length; i++) {
        if (
          (await this.compare(arr, i - 1, '>', i)) &&
          (i + 1 >= arr.length || (await this.compare(arr, i + 1, '>=', i)))
        ) {
          for (let j = swapIndex; j < i; j++) {
            if (
              !(
                (await this.compare(arr, i - 1, '>', j)) &&
                (i + 1 >= arr.length ||
                  (await this.compare(arr, i + 1, '>=', j)))
              )
            ) {
              await this.drawAndSwap(arr, j, i);
              isSorted = false;
              swapIndex++;
              break;
            }
          }
        }
      }
    }
  };

  /* Not quite there yet
  bullySort2 = async (arr: SortValue[]) => {
    let isSorted = false;
    while (!isSorted) {
      isSorted = true;
      let swapIndex = 0;
      const test = async (arr, i) => { 
        if (arr[i - 1].x > arr[i].x && (arr[i+1]?.x ?? Infinity) > arr[i].x) {
          if (!((arr[i - 1]?.x ?? -Infinity) > arr[swapIndex].x && (arr[i+1]?.x ?? Infinity) > arr[swapIndex].x)) {
            isSorted = false;
            await this.drawAndSwap(arr, swapIndex, i);
            this.highlight(arr, [swapIndex, i])
            await sleep(this.state.swapTime);
            if (swapIndex > 0) {
              const temp = swapIndex;
              swapIndex = 0;
              await test(arr, temp);
            }
          } else {
            swapIndex++;
            await test(arr, i);
          }
        }
      }
      for (let i = 1; i < arr.length; i++) {
        await test(arr, i);
      }
    }
  }
  */

  //#region merge sort
  /* In-place merge sort is complicated...
  mergeSort = async (arr, start, end) => {
    if (start >= end) return
    if (end-start === 1) {
      if (arr[start] > arr[end]) {
        await this.drawAndSwap(arr, start, end);
        await sleep(this.state.swapTime);
      }
    }

    const mid = Math.floor((start+end) / 2)
    this.mergeSort(arr, start, mid)
    this.mergeSort(arr, mid+1, end)
    let i = start
    let j = mid+1
    while (i < mid && j < end) {
      if (arr[i] > arr[j]) {
        await this.drawAndSwap(arr, i, j);
        await sleep(this.state.swapTime);
      }
    }
  }
  */
  //#endregion

  quickSort = async (
    arr: SortValue[],
    start = 0,
    end = this.state.columnNbr - 1,
  ) => {
    if (start >= end) return;

    const mid = Math.floor((start + end) / 2);

    if (await this.compare(arr, mid, '<', start)) {
      await this.drawAndSwap(arr, start, mid);
    }
    if (await this.compare(arr, end, '<', start)) {
      await this.drawAndSwap(arr, start, end);
    }
    if (await this.compare(arr, mid, '<', end)) {
      await this.drawAndSwap(arr, mid, end);
    }

    let i = start;
    for (let j = start; j < end; j++) {
      if (await this.compare(arr, j, '<', end)) {
        await this.drawAndSwap(arr, i, j);
        i++;
      }
    }
    await this.drawAndSwap(arr, i, end);

    await this.quickSort(arr, start, i - 1);
    await this.quickSort(arr, i + 1, end);
  };

  shellSort = async (arr: SortValue[]) => {
    const gaps = [701, 301, 132, 57, 23, 10, 4, 1]; // from https://oeis.org/A102549
    for (const gap of gaps) {
      if (gap > this.state.columnNbr) continue;
      for (let i = gap; i < this.state.columnNbr; i++) {
        for (let j = i; j >= gap; j -= gap) {
          if (await this.compare(arr, j - gap, '>', j)) {
            await this.drawAndSwap(arr, j - gap, j);
          }
        }
      }
    }
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
      // With a zero compareTime, maximum update depth will be exceeded
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
    // With a zero compareTime, maximum update depth will be exceeded
    // when updating state too often
    if (this.state.compareTime) {
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

  swap = (arr: SortValue[], i1: number, i2: number) => {
    if (!this.state.isSorting) throw Error('isSorting is false!');
    [arr[i1], arr[i2]] = [arr[i2], arr[i1]];
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
    this.arr = createArr(value instanceof Array ? value[0] : value);
    this.setState({ columnNbr: value }, () => this.resetAndDraw());
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
          <AppBar position="relative">
            <Toolbar className="toolbar">
              <div>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => this.sort(this.arr)}
                  disableElevation
                  startIcon={
                    !this.state.isSorting ? <PlayCircle /> : <StopCircle />
                  }
                >
                  Sort
                </Button>
              </div>
              <div>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={this.shuffleAndDraw}
                  disableElevation
                >
                  Shuffle
                </Button>
              </div>
              <div>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={this.resetAndDraw}
                  disableElevation
                >
                  Reset
                </Button>
              </div>
              <div>
                <FormControlLabel
                  control={
                    <Switch
                      checked={this.state.canDraw}
                      onChange={this.toggleCanDraw}
                      name="canDraw"
                      color="secondary"
                    />
                  }
                  label="Draw Mode"
                />
              </div>
              <div>
                <Typography align="left" color="white">
                  Swaps: {this.state.nbrOfSwaps}
                </Typography>
              </div>
              <div>
                <Typography align="left" color="white">
                  Comparisons: {this.state.nbrOfComparisons}
                </Typography>
              </div>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                className="open-drawer-button"
                onClick={this.toggleDisplaySettings}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

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

          <Drawer
            variant="persistent"
            anchor="right"
            className="drawer"
            open={this.state.areSettingsOpen}
            PaperProps={{
              sx: { width: '20%' },
            }}
          >
            <div className="chevron-wrapper">
              <IconButton onClick={this.toggleDisplaySettings}>
                <ChevronRightIcon />
              </IconButton>
            </div>
            <div className="select-wrapper">
              <FormControl component="fieldset">
                <Typography
                  align="left"
                  variant="h6"
                  color="textSecondary"
                  gutterBottom
                >
                  Sorting Algorithm
                </Typography>
                <Select
                  value={this.state.chosenSortAlg}
                  onChange={this.chooseSortAlg}
                  size="small"
                >
                  {Object.values(SortName).map((v) => (
                    <MenuItem value={v}>
                      <Typography
                        align="left"
                        variant="body1"
                        color="textSecondary"
                      >
                        {v}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div>
              <Typography
                align="left"
                variant="h6"
                color="textSecondary"
                gutterBottom
              >
                # Columns
              </Typography>
              <div className="col-slider">
                <Slider
                  defaultValue={INIT_COLUMN_NUMBER}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  min={10}
                  max={1000}
                  onChangeCommitted={this.changeColumnNbr}
                />
              </div>
            </div>
            <div>
              <Typography
                align="left"
                variant="h6"
                color="textSecondary"
                gutterBottom
              >
                Time per swap (ms)
              </Typography>
              <div className="col-slider">
                <Slider
                  defaultValue={INIT_SWAP_TIME}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  min={0}
                  step={0.1}
                  max={10}
                  scale={(x) => timeScale(x)}
                  onChangeCommitted={this.changeSwapTime}
                />
              </div>
            </div>
            <div>
              <Typography
                align="left"
                variant="h6"
                color="textSecondary"
                gutterBottom
              >
                Time per comparison (ms)
              </Typography>
              <div className="col-slider">
                <Slider
                  defaultValue={INIT_COMPARE_TIME}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  min={0}
                  step={0.1}
                  max={10}
                  scale={(x) => timeScale(x)}
                  onChangeCommitted={this.changeCompareTime}
                />
              </div>
            </div>
            <div className="select-wrapper">
              <FormControl component="fieldset">
                <Typography
                  align="left"
                  variant="h6"
                  color="textSecondary"
                  gutterBottom
                >
                  Reset Preset
                </Typography>
                <Select
                  value={this.state.resetPreset}
                  onChange={this.chooseResetPreset}
                  size="small"
                >
                  {Object.values(ResetPreset).map((v) => (
                    <MenuItem value={v}>
                      <Typography
                        align="left"
                        variant="body1"
                        color="textSecondary"
                      >
                        {v}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </Drawer>
        </div>
      </div>
    );
  }
}

export default App;
