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
  private image: HTMLImageElement = new Image();

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

  updateImageSrc(arr: SortValue[]) {
    this.image.src = this.context.imageSrc || '';
    this.image.onload = () => {
      this.redrawAll(arr);
    };
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
      case ColorPreset.Image:
        return '#FFFFFFF';
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
      case ColorPreset.Image:
        return this.context.highlightColors[type];
      case ColorPreset.Rainbow:
        return '#FFFFFF';
    }
  }

  isCellType() {
    switch (this.context.visualizationType) {
      case VisualizationType.Dots:
      case VisualizationType.Matrix:
        return true;
      default:
        return false;
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
      this.clearHighlights(arr);
      this.currentDrawIteration = drawIteration ?? null;
    }
    this.highlightIndices.push(...indices);
    if (!this.context.shouldHighlight) {
      this.clearHighlights(arr);
      return;
    }

    for (const idx of indices) {
      if (this.context.visualizationType === VisualizationType.Matrix) {
        this.drawCell(arr, idx, this.getHighlightColor(type));
        continue;
      }
      if (this.context.visualizationType === VisualizationType.Chords) {
        this.redrawChord(arr, idx, this.getHighlightColor(type));
        continue;
      }
      if (this.context.visualizationType === VisualizationType.Spiral) {
        this.redrawCircleSector(arr, idx, this.getHighlightColor(type));
        continue;
      }
      this.redrawColumn(arr, idx, this.getHighlightColor(type));
    }
  };

  redraw = (arr: SortValue[], indices: number[]) => {
    for (const idx of indices) {
      if (this.context.visualizationType === VisualizationType.Spiral) {
        this.redrawCircleSector(arr, idx);
        continue;
      }
      if (this.context.visualizationType === VisualizationType.Matrix) {
        this.drawCell(arr, idx);
        continue;
      }
      if (this.context.visualizationType === VisualizationType.Chords) {
        this.redrawChord(arr, idx);
        continue;
      }
      this.redrawColumn(arr, idx);
    }
  };

  redrawAll = (arr: SortValue[]) => {
    this.clearAll();
    this.drawAll(arr);
  };

  indexInBounds = (i: number) => {
    return i >= 0 && i < this.context.columnNbr;
  };

  boundColHeight = (y: number) => {
    return Math.min(Math.max(y, 0), this.context.columnNbr - 1);
  };

  colHeightInBounds = (y: number) => {
    return y === this.boundColHeight(y);
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
        i !== colIndex && this.indexInBounds(i);
        i += indexIncr
      ) {
        curHeight +=
          (colHeight - this.prevDrawHeight) /
          Math.abs(colIndex - this.prevDrawIndex);
        curHeight = this.boundColHeight(curHeight);
        drawData.push({
          index: i,
          value: Math.floor(curHeight),
        });
      }
    }

    if (this.indexInBounds(colIndex)) {
      drawData.push({
        index: colIndex,
        value: this.boundColHeight(colHeight),
      });
      this.prevDrawIndex = colIndex;
      this.prevDrawHeight = colHeight;
    }

    if (!this.indexInBounds(colIndex) || !this.colHeightInBounds(colHeight)) {
      this.endDraw();
    }

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

  private redrawCircleSector = (
    arr: SortValue[],
    i: number,
    color?: string,
  ) => {
    this.clearCircleSector(i);
    this.drawCircleSector(arr, i, color);
  };

  private redrawChord = (arr: SortValue[], i: number, color?: string) => {
    this.clearChord(arr, i);
    this.drawChord(arr, i, color);
  };

  private drawAll = (arr: SortValue[]) => {
    if (this.context.visualizationType === VisualizationType.Matrix) {
      for (let i = 0; i < arr.length; i++) {
        this.drawCell(arr, i);
      }
      return;
    }

    if (this.context.visualizationType === VisualizationType.Spiral) {
      for (let i = 0; i < arr.length; i++) {
        this.drawCircleSector(arr, i);
      }
      return;
    }

    if (this.context.visualizationType === VisualizationType.Chords) {
      for (let i = 0; i < arr.length; i++) {
        this.redrawChord(arr, i);
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

  private drawCell = (arr: SortValue[], i: number, color?: string) => {
    const sqrtColumnNbr = Math.floor(Math.sqrt(this.context.columnNbr));
    const { x, y } = this.getMatrixCoordinates(i);

    const width = this.width / sqrtColumnNbr;
    const height = this.height / sqrtColumnNbr;
    const startX = width * x;
    const startY = height * y;

    if (!color && this.context.colorPreset === ColorPreset.Image) {
      const { x: oX, y: oY } = this.getMatrixCoordinates(arr[i].value);
      const originalX = oX * width;
      const originalY = oY * height;

      this.drawImageRect({
        startX,
        startY,
        width,
        height,
        originalX,
        originalY,
      });
      return;
    }

    this.canvas2dCtx.fillStyle = color || this.getColumnColor(arr[i].value);
    this.fillRect({ startX, startY, width, height });
  };

  private getMatrixCoordinates = (i: number) => {
    const sqrtColumnNbr = Math.floor(Math.sqrt(this.context.columnNbr));

    let indexInDiagonalOrder = i;
    let diagSum = 0; // x + y

    while (diagSum < 2 * sqrtColumnNbr - 1) {
      const diagonalLength =
        diagSum < sqrtColumnNbr ? diagSum + 1 : 2 * sqrtColumnNbr - 1 - diagSum;

      if (indexInDiagonalOrder < diagonalLength) break;

      indexInDiagonalOrder -= diagonalLength;
      diagSum++;
    }

    const xStart = Math.max(0, diagSum - (sqrtColumnNbr - 1));
    const x = xStart + indexInDiagonalOrder;
    const y = diagSum - x;

    return { x, y };
  };

  private drawCircleSector = (arr: SortValue[], i: number, color?: string) => {
    this._drawCircleSector({ value: arr[i].value, i, color });
  };

  private clearCircleSector = (i: number) => {
    this._drawCircleSector({
      value: this.context.columnNbr,
      i,
      shouldClear: true,
    });
  };

  private _drawCircleSector = (params: {
    value: number;
    i: number;
    color?: string;
    shouldClear?: boolean;
  }) => {
    const { value, i, color, shouldClear } = params;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const maxRadius = Math.min(centerX, centerY);
    const anglePerColumn = (2 * Math.PI) / this.context.columnNbr;
    const radius = (maxRadius / (this.context.columnNbr + 1)) * (value + 1);
    const startAngle = anglePerColumn * i;
    const endAngle = anglePerColumn * (i + 1);
    const gap = !shouldClear ? anglePerColumn * this.context.gapSize : 0;

    this.drawArc({
      x: centerX,
      y: centerY,
      radius: this.snap(radius),
      startAngle: startAngle + gap,
      endAngle,
      color: color || this.getColumnColor(value),
      shouldClear,
    });

    if (!shouldClear && this.context.spiralWidth < 1) {
      this.drawArc({
        x: centerX,
        y: centerY,
        radius: this.snap(
          Math.max(radius - maxRadius * this.context.spiralWidth, 0),
        ),
        startAngle: startAngle + gap,
        endAngle,
        shouldClear: true,
      });
    }
  };

  private drawArc = (params: {
    x: number;
    y: number;
    radius: number;
    startAngle: number;
    endAngle: number;
    color?: string;
    shouldClear?: boolean;
  }) => {
    const { x, y, radius, startAngle, endAngle, color, shouldClear } = params;

    if (color) {
      this.canvas2dCtx.fillStyle = color;
    }
    if (shouldClear) {
      this.canvas2dCtx.save();
      this.canvas2dCtx.globalCompositeOperation = 'destination-out';
    }
    this.canvas2dCtx.beginPath();
    this.canvas2dCtx.arc(x, y, radius, startAngle, endAngle);
    this.canvas2dCtx.lineTo(x, y);
    this.canvas2dCtx.closePath();
    this.canvas2dCtx.fill();
    this.canvas2dCtx.restore();
  };

  private drawChord = (arr: SortValue[], i: number, color?: string) => {
    this._drawChord({ value: arr[i].value, i, color });
  };

  private clearChord = (arr: SortValue[], i: number) => {
    this._drawChord({ value: arr[i].value, i, shouldClear: true });
  };

  private _drawChord = (params: {
    value: number;
    i: number;
    color?: string;
    shouldClear?: boolean;
  }) => {
    const { value, i, color, shouldClear } = params;

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    let radius = Math.min(centerX, centerY);
    let lineWidth = (2 * Math.PI * radius) / this.context.columnNbr;
    radius = radius - lineWidth / 2;
    lineWidth = (2 * Math.PI * radius) / this.context.columnNbr;
    const anglePerColumn = (2 * Math.PI) / this.context.columnNbr;

    if (shouldClear) {
      this.canvas2dCtx.save();
      this.canvas2dCtx.globalCompositeOperation = 'destination-out';
    }
    this.canvas2dCtx.strokeStyle = color || this.getColumnColor(value);
    this.canvas2dCtx.lineWidth = lineWidth * (1 - this.context.gapSize);
    this.canvas2dCtx.lineCap = 'round';
    this.canvas2dCtx.beginPath();
    this.canvas2dCtx.moveTo(
      centerX + Math.cos(anglePerColumn * value) * radius,
      centerY + Math.sin(anglePerColumn * value) * radius,
    );
    this.canvas2dCtx.lineTo(
      centerX + Math.cos(anglePerColumn * i) * radius,
      centerY + Math.sin(anglePerColumn * i) * radius,
    );
    this.canvas2dCtx.stroke();
    if (shouldClear) {
      this.canvas2dCtx.restore();
    }
  };

  private drawColumn = (arr: SortValue[], i: number, color?: string) => {
    const width = this.width / this.context.columnNbr;
    const height = this.getColumnHeight(arr[i].value);
    const startX = width * i;
    const startY = this.getColumnStartY(arr[i].value);

    if (!color && this.context.colorPreset === ColorPreset.Image) {
      this.drawImageRect({
        startX,
        startY,
        width,
        height,
        originalX: arr[i].value * width,
        originalY: startY,
      });
      return;
    }

    this.canvas2dCtx.fillStyle = color || this.getColumnColor(arr[i].value);
    this.fillRect({ startX, startY, width, height });
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

  private fillRect = (params: {
    startX: number;
    startY: number;
    width: number;
    height: number;
  }) => {
    const { startX, startY, width, height } = params;
    const heightGap = this.isCellType() ? height * this.context.gapSize : 0;
    this.canvas2dCtx.fillRect(
      this.snap(startX + width * this.context.gapSize),
      this.snap(this.height - startY - height + heightGap),
      this.snap(width - width * this.context.gapSize),
      this.snap(height - heightGap),
    );
  };

  private clearColumn = (idx: number) => {
    const width = this.width / this.context.columnNbr;
    const startX = width * idx;

    this.clearRect(startX, 0, width, this.height);
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

  private drawImageRect(params: {
    startX: number;
    startY: number;
    width: number;
    height: number;
    originalX: number;
    originalY: number;
  }) {
    const { startX, startY, width, height, originalX, originalY } = params;
    if (!this.image?.src) {
      this.canvas2dCtx.fillStyle = this.context.backgroundColor;
      this.fillRect({ startX, startY, width, height });
      return;
    }

    const scaleX = this.image.naturalWidth / this.width;
    const scaleY = this.image.naturalHeight / this.height;

    const heightGap = this.isCellType() ? height * this.context.gapSize : 0;
    this.canvas2dCtx.drawImage(
      this.image,
      this.snap(originalX * scaleX),
      this.snap((this.height - originalY - height) * scaleY),
      this.snap(width * scaleX),
      this.snap(height * scaleY),
      this.snap(startX + width * this.context.gapSize),
      this.snap(this.height - startY - height + heightGap),
      this.snap(width - width * this.context.gapSize),
      this.snap(height - heightGap),
    );
  }

  private clearHighlights(arr: SortValue[]) {
    for (const idx of this.highlightIndices) {
      if (this.context.visualizationType === VisualizationType.Spiral) {
        this.redrawCircleSector(arr, idx);
        continue;
      }
      if (this.context.visualizationType === VisualizationType.Matrix) {
        this.drawCell(arr, idx);
        continue;
      }
      if (this.context.visualizationType === VisualizationType.Chords) {
        this.redrawAll(arr);
        continue;
      }
      this.redrawColumn(arr, idx);
    }
    this.highlightIndices = [];
  }
}
