import {
  ColorPreset,
  ColorSettings,
  DisplayType,
  DrawData,
  SortValue,
  VisualizationType,
  HighlightType,
} from './types';
import { hsvToRgbHex, rgbHexToHsv } from './utils';

export class CanvasController {
  private highlightIndices: number[] = [];
  private currentDrawIteration: number | null = null;
  prevDrawIndex: number | null = null;
  prevDrawHeight: number | null = null;
  isDrawing: boolean = false;
  _refCurrent: HTMLCanvasElement | null = null;
  _canvas2dCtx: CanvasRenderingContext2D | null = null;

  constructor(
    public context: {
      canvasRef: React.RefObject<HTMLCanvasElement>;
      columnNbr: number;
    } & ColorSettings,
  ) {}

  get canvasRef() {
    return this.context.canvasRef;
  }

  get refCurrent() {
    if (this._refCurrent) {
      return this._refCurrent;
    }
    const current = this.context.canvasRef.current;
    if (current == null) {
      throw Error('canvasRef.current is null!');
    }
    this._refCurrent = current;
    return current;
  }

  get canvas2dCtx() {
    if (this._canvas2dCtx) {
      return this._canvas2dCtx;
    }
    const context = this.refCurrent.getContext('2d');

    if (context == null) {
      throw Error('context is null!');
    }
    this._canvas2dCtx = context;
    return context;
  }

  get dpr() {
    return window.devicePixelRatio || 1;
  }

  get height() {
    switch (this.context.displayType) {
      case DisplayType.Full:
        return this.canvas2dCtx.canvas.height / this.dpr;
      case DisplayType.Square:
        return (
          Math.min(
            this.canvas2dCtx.canvas.width,
            this.canvas2dCtx.canvas.height,
          ) / this.dpr
        );
    }
  }

  get width() {
    switch (this.context.displayType) {
      case DisplayType.Full:
        return this.canvas2dCtx.canvas.width / this.dpr;
      case DisplayType.Square:
        return (
          Math.min(
            this.canvas2dCtx.canvas.width,
            this.canvas2dCtx.canvas.height,
          ) / this.dpr
        );
    }
  }

  getGradientColor(value: number) {
    // eslint-disable-next-line prefer-const
    let [h1, s1, v1] = rgbHexToHsv(this.context.columnColor1);
    // eslint-disable-next-line prefer-const
    let [h2, s2, v2] = rgbHexToHsv(this.context.columnColor2);
    if (h1 === 0 && s1 === 0) {
      h1 = h2;
    }
    if (h2 === 0 && s2 === 0) {
      h2 = h1;
    }

    // Use the shortest path in the hue circle
    let hDiff = h2 - h1;
    hDiff += hDiff > 180 ? -360 : hDiff < -180 ? 360 : 0;

    const sDiff = s2 - s1;
    const vDiff = v2 - v1;
    const multiplier = value / this.context.columnNbr;

    return hsvToRgbHex(
      // TODO: Use additive/subtractive color mixing instead of hue shifting?
      (h1 + hDiff * multiplier + 360) % 360,
      s1 + sDiff * multiplier,
      v1 + vDiff * multiplier,
    );
  }

  getColumnColor(value: number) {
    switch (this.context.colorPreset) {
      case ColorPreset.Custom:
        return this.context.columnColor1;
      case ColorPreset.CustomGradient:
        return this.getGradientColor(value);
      case ColorPreset.Rainbow:
        return hsvToRgbHex((360 * value) / this.context.columnNbr, 1, 1);
    }
  }

  getCellColor(value1: number, value2: number) {
    switch (this.context.colorPreset) {
      case ColorPreset.Custom:
        return this.context.columnColor1;
      case ColorPreset.CustomGradient:
        return this.getGradientColor((value1 + value2) / 2);
      case ColorPreset.Rainbow:
        return hsvToRgbHex(
          ((value1 + value2) / this.context.columnNbr) * 180,
          1,
          1,
        );
    }
  }

  getHighlightColor(type: HighlightType) {
    switch (this.context.colorPreset) {
      case ColorPreset.Custom:
      case ColorPreset.CustomGradient:
        return this.context.highlightColors[type];
      case ColorPreset.Rainbow:
        return '#FFFFFF';
    }
  }

  resizeCanvas = (arr: SortValue[]) => {
    const parent = this.canvas2dCtx.canvas.parentElement;
    if (parent === null) {
      throw Error('parent is null!');
    }

    const { width, height } = parent.getBoundingClientRect();
    const currentWidth = this.canvas2dCtx.canvas.width;
    const currentHeight = this.canvas2dCtx.canvas.height;
    const newWidth = Math.round(width * this.dpr);
    const newHeight = Math.round(height * this.dpr);
    if (currentWidth === newWidth && currentHeight === newHeight) {
      return;
    }

    this.canvas2dCtx.canvas.width = newWidth;
    this.canvas2dCtx.canvas.height = newHeight;
    this.canvas2dCtx.canvas.style.width = width + 'px';
    this.canvas2dCtx.canvas.style.height = height + 'px';
    this.canvas2dCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.drawAll(arr);
  };

  highlight = (
    arr: SortValue[],
    indices: number[],
    type: HighlightType = 'comparison',
    drawIteration?: number,
  ) => {
    if (drawIteration == null || drawIteration !== this.currentDrawIteration) {
      if (this.highlightIndices.length) {
        for (const idx of this.highlightIndices) {
          if (this.context.visualizationType === VisualizationType.Matrix) {
            this.redrawCellRow(arr, idx);
            this.redrawCellColumn(arr, idx);
            continue;
          }
          this.redrawColumn(arr, idx);
        }
      }
      this.currentDrawIteration = drawIteration ?? null;
      this.highlightIndices = [];
    }
    this.highlightIndices.push(...indices);

    for (const idx of indices) {
      if (this.context.visualizationType === VisualizationType.Matrix) {
        this.redrawCellRow(arr, idx, this.getHighlightColor(type));
        this.redrawCellColumn(arr, idx, this.getHighlightColor(type));
        continue;
      }
      this.redrawColumn(arr, idx, this.getHighlightColor(type));
    }
  };

  redraw = (arr: SortValue[], indices: number[]) => {
    for (const idx of indices) {
      if (this.context.visualizationType === VisualizationType.Matrix) {
        this.redrawCellRow(arr, idx);
        this.redrawCellColumn(arr, idx);
        continue;
      }
      this.redrawColumn(arr, idx);
    }
  };

  redrawAll = (arr: SortValue[]) => {
    this.clearAll();
    this.drawAll(arr);
  };

  getDrawData = (mouseX: number, mouseY: number): DrawData[] => {
    if (!this.isDrawing) return [];

    const drawData = [];

    const canvas = this.context.canvasRef.current;
    if (canvas == null) {
      throw Error('canvas is null!');
    }

    const context = canvas.getContext('2d');
    if (context == null) {
      throw Error('context is null!');
    }
    const rect = canvas.getBoundingClientRect();

    const colIndex = Math.floor(
      ((mouseX - rect.left) / this.width) * this.context.columnNbr,
    );
    const colHeight = Math.floor(
      ((this.height - (mouseY - rect.top)) / this.height) *
        this.context.columnNbr,
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
        drawData.push({
          index: i,
          value: Math.floor(curHeight),
        });
      }
    }

    drawData.push({
      index: colIndex,
      value: colHeight,
    });
    this.prevDrawIndex = colIndex;
    this.prevDrawHeight = colHeight;
    return drawData;
  };

  stopSorting = (arr: SortValue[]) => {
    if (this.highlightIndices) {
      this.removeHighlight(arr);
    }
    this.highlightIndices = [];
  };

  private removeHighlight = (arr: SortValue[]) => {
    this.highlight(arr, []);
  };

  private redrawColumn = (arr: SortValue[], i: number, color?: string) => {
    this.clearColumn(i);
    this.drawColumn(arr, i, color);
  };

  private redrawCellColumn = (arr: SortValue[], i: number, color?: string) => {
    for (let j = 0; j < this.context.columnNbr; j++) {
      this.redrawCell(arr, i, j, color);
    }
  };

  private redrawCellRow = (arr: SortValue[], j: number, color?: string) => {
    for (let i = 0; i < this.context.columnNbr; i++) {
      this.redrawCell(arr, i, j, color);
    }
  };

  private redrawCell = (
    arr: SortValue[],
    i: number,
    j: number,
    color?: string,
  ) => {
    this.clearCell(i, j);
    this.drawCell(arr, i, j, color);
  };

  private drawAll = (arr: SortValue[]) => {
    if (this.context.visualizationType === VisualizationType.Matrix) {
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
          this.drawCell(arr, i, j);
        }
      }
      return;
    }

    for (let i = 0; i < arr.length; i++) {
      this.drawColumn(arr, i);
    }
  };

  private clearAll = () => {
    this.canvas2dCtx.clearRect(
      0,
      0,
      this.canvas2dCtx.canvas.width,
      this.canvas2dCtx.canvas.height,
    );
  };

  private drawCell = (
    arr: SortValue[],
    i: number,
    j: number,
    color?: string,
  ) => {
    const width = this.width / this.context.columnNbr;
    const height = this.height / this.context.columnNbr;
    const startX = width * i;
    const startY = height * j;

    this.canvas2dCtx.fillStyle =
      color || this.getCellColor(arr[i].value, arr[j].value);
    this.fillRect(startX, startY, width, height);
  };

  private drawColumn = (arr: SortValue[], i: number, color?: string) => {
    const width = this.width / this.context.columnNbr;
    const height = this.getColumnHeight(arr[i].value);
    const startX = width * i;
    const startY = this.getColumnStartY(arr[i].value);

    this.canvas2dCtx.fillStyle = color || this.getColumnColor(arr[i].value);
    this.fillRect(startX, startY, width, height);
  };

  private getColumnStartY = (value: number) => {
    switch (this.context.visualizationType) {
      case VisualizationType.Dots:
        return (this.height / this.context.columnNbr) * value;
      default:
        return 0;
    }
  };

  private getColumnHeight = (value: number) => {
    switch (this.context.visualizationType) {
      case VisualizationType.Bars:
        return (this.height / this.context.columnNbr) * (value + 1);
      case VisualizationType.Dots:
        return this.width / this.context.columnNbr;
      default:
        return this.height;
    }
  };

  snap = (v: number) => {
    return Math.ceil(v * this.dpr) / this.dpr;
  };

  private fillRect = (
    startX: number,
    startY: number,
    width: number,
    height: number,
  ) => {
    this.canvas2dCtx.fillRect(
      this.snap(startX + this.context.gapSize),
      this.snap(this.height - startY - height + this.context.gapSize),
      this.snap(width - this.context.gapSize),
      this.snap(height - this.context.gapSize),
    );
  };

  private clearColumn = (idx: number) => {
    const width = this.width / this.context.columnNbr;
    const startX = width * idx;

    this.clearRect(startX, 0, width, this.height);
  };

  private clearCell = (i: number, j: number) => {
    const width = this.width / this.context.columnNbr;
    const height = this.height / this.context.columnNbr;
    const startX = width * i;
    const startY = height * j;

    this.clearRect(startX, startY, width, height);
  };

  private clearRect = (
    startX: number,
    startY: number,
    width: number,
    height: number,
  ) => {
    this.canvas2dCtx.clearRect(
      this.snap(startX),
      this.snap(this.height - startY - height),
      this.snap(width),
      this.snap(height),
    );
  };

  endDraw = () => {
    this.isDrawing = false;
    this.prevDrawIndex = null;
    this.prevDrawHeight = null;
  };
}
