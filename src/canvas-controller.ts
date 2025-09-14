import { ColorPreset, DrawData, SortValue, VisualizationType } from './types';
import { hsvToRgbHex, rgbHexToHsv } from './utils';

export class CanvasController {
  private prevHighlightIndices: number[] | null = null;
  prevDrawIndex: number | null = null;
  prevDrawHeight: number | null = null;
  isDrawing: boolean = false;
  _refCurrent: HTMLCanvasElement | null = null;
  _canvas2dCtx: CanvasRenderingContext2D | null = null;

  constructor(
    private context: {
      canvasRef: React.RefObject<HTMLCanvasElement>;
      columnNbr: number;
      colorPreset: ColorPreset;
      columnColor1: string;
      columnColor2: string;
      highlightColor: string;
      visualizationType: VisualizationType;
    },
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

  set columnNbr(value: number) {
    this.context.columnNbr = value;
  }

  set colorPreset(value: ColorPreset) {
    this.context.colorPreset = value;
  }

  set columnColor1(value: string) {
    this.context.columnColor1 = value;
  }

  set columnColor2(value: string) {
    this.context.columnColor2 = value;
  }

  set highlightColor(value: string) {
    this.context.highlightColor = value;
  }

  set visualizationType(value: VisualizationType) {
    this.context.visualizationType = value;
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

  getColumnColor1(value: number) {
    switch (this.context.colorPreset) {
      case ColorPreset.Custom:
        return this.context.columnColor1;
      case ColorPreset.CustomGradient:
        return this.getGradientColor(value);
      case ColorPreset.Rainbow:
        return hsvToRgbHex((360 * value) / this.context.columnNbr, 1, 1);
    }
  }

  getHighlightColor() {
    switch (this.context.colorPreset) {
      case ColorPreset.Custom:
      case ColorPreset.CustomGradient:
        return this.context.highlightColor;
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
      ((mouseX - rect.left) / canvas.width) * this.context.columnNbr,
    );
    const colHeight = Math.floor(
      ((canvas.height - (mouseY - rect.top)) / canvas.height) *
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
    const width = this.canvas2dCtx.canvas.width / this.context.columnNbr;
    const height = this.getColumnHeight(arr[i].value);
    const startX = width * i;
    const startY = this.getColumnStartY(arr[i].value);

    this.canvas2dCtx.fillStyle = color || this.getColumnColor1(arr[i].value);
    this.fillRect(startX, startY, width, height);
  };

  private getColumnStartY = (value: number) => {
    switch (this.context.visualizationType) {
      case VisualizationType.Dots:
        return (
          (this.canvas2dCtx.canvas.height / this.context.columnNbr) *
          (value - 1)
        );
      default:
        return 0;
    }
  };

  private getColumnHeight = (value: number) => {
    switch (this.context.visualizationType) {
      case VisualizationType.Bars:
        return (
          (this.canvas2dCtx.canvas.height / this.context.columnNbr) *
          (value + 1)
        );
      case VisualizationType.Dots:
        return this.canvas2dCtx.canvas.width / this.context.columnNbr;
      case VisualizationType.Colors:
        return this.canvas2dCtx.canvas.height;
    }
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
    const width = this.canvas2dCtx.canvas.width / this.context.columnNbr;
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

  endDraw = () => {
    this.isDrawing = false;
    this.prevDrawIndex = null;
    this.prevDrawHeight = null;
  };
}
