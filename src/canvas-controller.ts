import { MouseEvent } from 'react';
import { ColorPreset, DrawData, SortValue } from './types';
import { hsvToRgbHex, rgbHexToHsv } from './utils';

export class CanvasController {
  private prevHighlightIndices: number[] | null = null;
  prevDrawIndex: number | null = null;
  prevDrawHeight: number | null = null;
  isDrawing: boolean = false;
  _refCurrent: HTMLCanvasElement | null = null;
  _canvas2dCtx: CanvasRenderingContext2D | null = null;

  constructor(
    public canvasRef: React.RefObject<HTMLCanvasElement>,
    public columnNbr: number,
    public colorPreset: ColorPreset,
    public columnColor1: string,
    public columnColor2: string,
    public highlightColor: string,
  ) {}

  get refCurrent() {
    if (this._refCurrent) {
      return this._refCurrent;
    }
    const current = this.canvasRef.current;
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

  getGradientColor(value: number) {
    // eslint-disable-next-line prefer-const
    let [h1, s1, v1] = rgbHexToHsv(this.columnColor1);
    // eslint-disable-next-line prefer-const
    let [h2, s2, v2] = rgbHexToHsv(this.columnColor2);
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
    const multiplier = value / this.columnNbr;

    return hsvToRgbHex(
      // TODO: Use additive/subtractive color mixing instead of hue shifting?
      (h1 + hDiff * multiplier + 360) % 360,
      s1 + sDiff * multiplier,
      v1 + vDiff * multiplier,
    );
  }

  getColumnColor1(value: number) {
    switch (this.colorPreset) {
      case ColorPreset.Custom:
        return this.columnColor1;
      case ColorPreset.CustomGradient:
        return this.getGradientColor(value);
      case ColorPreset.Rainbow:
        return hsvToRgbHex((360 * value) / this.columnNbr, 1, 1);
    }
  }

  getHighlightColor() {
    switch (this.colorPreset) {
      case ColorPreset.Custom:
      case ColorPreset.CustomGradient:
        return this.highlightColor;
      case ColorPreset.Rainbow:
        return '#FFFFFF';
    }
  }

  resizeCanvas = (arr: SortValue[]) => {
    const parent = document.getElementById('canvas-wrapper');
    if (parent === null) {
      throw Error('parent is null!');
    }

    // Set height to 0 to make parent div confined to window size
    this.canvas2dCtx.canvas.height = 0;
    this.canvas2dCtx.canvas.width = parent.offsetWidth;
    this.canvas2dCtx.canvas.height = parent.offsetHeight;

    this.drawAll(arr);
  };

  highlightColumns = (arr: SortValue[], indices: number[]) => {
    //if (!this.state.isSorting) throw Error('isSorting is false!');

    if (this.prevHighlightIndices) {
      for (const idx of this.prevHighlightIndices) {
        this.redrawColumn(arr, idx);
      }
    }
    this.prevHighlightIndices = indices;

    for (const idx of indices) {
      this.redrawColumn(arr, idx, this.getHighlightColor());
    }
  };

  redrawColumns = (arr: SortValue[], indices: number[]) => {
    for (const index of indices) {
      this.redrawColumn(arr, index);
    }
  };

  redraw = (arr: SortValue[]) => {
    this.clearAll();
    this.drawAll(arr);
  };

  getDrawData = (event: MouseEvent<HTMLCanvasElement>): DrawData[] => {
    if (!this.isDrawing) return [];

    const drawData = [];

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
      ((event.clientX - rect.left) / canvas.width) * this.columnNbr,
    );
    const colHeight = Math.floor(
      ((canvas.height - (event.clientY - rect.top)) / canvas.height) *
        this.columnNbr,
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
    if (this.prevHighlightIndices) {
      this.removeHighlight(arr);
    }
    this.prevHighlightIndices = null;
  };

  private removeHighlight = (arr: SortValue[]) => {
    this.highlightColumns(arr, []);
  };

  private redrawColumn = (arr: SortValue[], i: number, color?: string) => {
    this.clearColumn(i);
    this.drawColumn(arr, i, color);
  };

  private drawAll = (arr: SortValue[]) => {
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

  private drawColumn = (arr: SortValue[], i: number, color?: string) => {
    const width = this.canvas2dCtx.canvas.width / this.columnNbr;
    const height =
      (this.canvas2dCtx.canvas.height / this.columnNbr) * (arr[i].value + 1);
    const startX = width * i;

    this.canvas2dCtx.fillStyle = color || this.getColumnColor1(arr[i].value);
    this.fillRect(startX, 0, width, height);
  };

  private fillRect = (
    startX: number,
    startY: number,
    width: number,
    height: number,
  ) => {
    const ctxHeight = this.canvas2dCtx.canvas.height;
    this.canvas2dCtx.fillRect(
      startX,
      Math.floor(ctxHeight) - Math.floor(startY) - Math.floor(height),
      Math.floor(width),
      Math.floor(height),
    );
  };

  private clearColumn = (idx: number) => {
    const width = this.canvas2dCtx.canvas.width / this.columnNbr;
    const startX = width * idx;

    this.clearRect(startX, width);
  };

  private clearRect = (startX: number, width: number) => {
    const ctxHeight = this.canvas2dCtx.canvas.height;
    this.canvas2dCtx.clearRect(
      startX - 1,
      0,
      Math.floor(width) + 2,
      Math.floor(ctxHeight),
    );
  };
}
