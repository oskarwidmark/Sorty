import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Drawer from "@material-ui/core/Drawer";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Typography from "@material-ui/core/Typography";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import Slider from "@material-ui/core/Slider";
import Switch from "@material-ui/core/Switch";
import "./App.css";

const swapTime = 0;
const initColumnNbr = 100;

//** REMOVE ARR FROM STATE - IS NOT USED IN COMPONENTS!
//









function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

const timeScale = (x) => Math.round(2 ** x)-1

const sleep = (ms) => {
  if (ms === 0) return new Promise((resolve) => setImmediate(resolve));

  return new Promise((resolve) => setTimeout(resolve, ms));
};

function hsvToRgbHex(h, s, v) {
  let f = (n, k = (n + h / 60) % 6) =>
    Math.round((v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)) * 255);

  return (
    "#" +
    [f(5), f(3), f(1)]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

class App extends React.Component {
  constructor(props) {
    super();

    this.arr = [...Array(initColumnNbr).keys()];
    shuffleArray(this.arr);
    this.state = {
      isSorting: false,
      areSettingsOpen: false,
      chosenSortAlg: "Insertion Sort",
      columnNbr: initColumnNbr,
      swapTime: swapTime,
      isDrawing: false,
      canDraw: false
    };
    this.sortingAlgorithms = {
        "Insertion Sort": this.insertionSort,
        "Selection Sort": this.selectionSort,
        "Cocktail Shaker Sort": this.cocktailShakerSort,
        "Bubble Sort": this.bubbleSort,
    };
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    const canvas = this.canvasRef.current;
    const context = canvas.getContext("2d");
    var parent = document.getElementById("canvas-wrapper");

    context.canvas.width = parent.offsetWidth;
    context.canvas.height = parent.offsetHeight;

    this.drawAll(context, this.arr);
  }

  drawDiff = (arr, i1, i2) => {
    if (!this.state.isSorting) throw Error("We should not be sorting!")

    const canvas = this.canvasRef.current;
    const context = canvas.getContext("2d");
    this.clearColumn(context, i1);
    this.drawColumn(context, arr, i1, i2);
  };

  drawAll = (ctx, arr) => {
    for (let i = 0; i < arr.length; i++) {
      this.drawColumn(ctx, arr, i, i);
    }
  };

  clearAll = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  drawColumn = (ctx, arr, i1, i2) => {
    const arrLength = arr.length;
    const width = ctx.canvas.width / this.state.columnNbr;
    const height = (ctx.canvas.height / this.state.columnNbr) * (arr[i2] + 1);
    const startX = width * i1;

    ctx.fillStyle = hsvToRgbHex((360 * arr[i2]) / arrLength, 1, 1);
    this.fillRect(ctx, startX, 0, width, height);
  };

  fillRect = (ctx, startX, startY, width, height) => {
    const ctxHeight = ctx.canvas.height;
    ctx.fillRect(
      startX,
      Math.floor(ctxHeight) - Math.floor(startY) - Math.floor(height),
      Math.floor(width),
      Math.floor(height)
    );
  };

  clearColumn = (ctx, idx) => {
    const width = ctx.canvas.width / this.state.columnNbr;
    const startX = width * idx;

    this.clearRect(ctx, startX, width);
  };

  clearRect = (ctx, startX, width) => {
    const ctxHeight = ctx.canvas.height;
    ctx.clearRect(startX - 1, 0, Math.floor(width) + 2, Math.floor(ctxHeight));
  };

  sort = async (arr) => {
    if (this.state.isSorting) return;

    this.setState({ isSorting: true }, async () => {
        try {
          await this.sortingAlgorithms[this.state.chosenSortAlg](arr);
          this.setState({ isSorting: false });
        }
        catch (e) {
          console.log("Sorting interrupted!")
          this.setState({ isSorting: false });
        }
      }
    );
  };

  bubbleSort = async (arr) => {
    var isSorted = false;
    while (!isSorted) {
      isSorted = true;
      for (let i = 1; i < arr.length; i++) {
        if (arr[i - 1] > arr[i]) {
          this.drawAndSwap(arr, i - 1, i);
          await sleep(this.state.swapTime);
          isSorted = false;
        }
      }
    }
  };

  // Bad implementation O(N^3)???
  insertionSort = async (arr) => {
    var isSorted = false;
    while (!isSorted) {
      isSorted = true;
      for (let i = 1; i < arr.length; i++) {
        if (arr[i - 1] > arr[i]) {
          this.drawAndSwap(arr, i - 1, i);
          await sleep(this.state.swapTime);
          isSorted = false;
          break;
        }
      }
    }
  };

  selectionSort = async (arr) => {
    for (let i = 0; i < arr.length; i++) {
      var curJ = i;
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[j] < arr[curJ]) {
          curJ = j;
        }
      }
      if (curJ !== i) {
        this.drawAndSwap(arr, curJ, i);
        await sleep(this.state.swapTime);
      }
    }
  };

  cocktailShakerSort = async (arr) => {
    var isSorted = false;
    var shouldSortReversed = false;
    while (!isSorted) {
      isSorted = true;
      if (shouldSortReversed) {
        for (let i = 1; i < arr.length; i++) {
          if (arr[i - 1] > arr[i]) {
            this.drawAndSwap(arr, i - 1, i);
            await sleep(this.state.swapTime);
            isSorted = false;
          }
        }
      } else {
        for (let i = arr.length - 1; i > 0; i--) {
          if (arr[i - 1] > arr[i]) {
            this.drawAndSwap(arr, i - 1, i);
            await sleep(this.state.swapTime);
            isSorted = false;
          }
        }
      }
      shouldSortReversed = !shouldSortReversed;
    }
  };

  stopSorting = () => {
    this.setState({ isSorting: false });
  }

  drawAndSwap = (arr, i1, i2) => {
    this.drawDiff(arr, i1, i2);
    this.drawDiff(arr, i2, i1);
    this.swap(arr, i1, i2);
  };

  swap = (arr, i1, i2) => {
    [arr[i1], arr[i2]] = [arr[i2], arr[i1]];
  };

  toggleDisplaySettings = () => {
    this.setState({ areSettingsOpen: !this.state.areSettingsOpen });
  };

  closeDisplaySettings = () => {
    this.setState({ areSettingsOpen: false });
  };

  chooseSortAlg = (event) => {
    this.stopSorting()

    this.setState({ chosenSortAlg: event.target.value });
  };

  changeColumnNbr = (event, value) => {
    this.stopSorting()

    this.arr = [...Array(value).keys()]
    this.setState({ columnNbr: value }, () => this.shuffleAndDraw());
  }

  changeSwapTime = (event, value) => {
    this.setState({ swapTime: value });
  }

  resetAndDraw = () => {
    this.arr = [...Array(this.state.columnNbr).keys()];
    this.shuffleAndDraw()
  }

  shuffleAndDraw = () => {
    this.stopSorting()

    const arr = this.arr
    shuffleArray(arr);
    this.setState({ arr })

    const canvas = this.canvasRef.current;
    const context = canvas.getContext("2d");

    this.clearAll(context)
    this.drawAll(context, arr)
  }


  drawOnCanvas = (event) => {
    if (!this.state.isDrawing) return

    const canvas = this.canvasRef.current;
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    const index = Math.floor((event.clientX - rect.left)/canvas.width*this.state.columnNbr);
    const height = Math.floor((canvas.height - (event.clientY - rect.top))/canvas.height*this.state.columnNbr);
    
    if (this.prevDrawIndex && this.prevDrawHeight) {
      const arr = this.arr
      const indexIncr = Math.sign(index-this.prevDrawIndex)
      let curHeight = this.prevDrawHeight
      console.log(curHeight)
      for (let i = this.prevDrawIndex + indexIncr; i !== index; i += indexIncr) {
        curHeight += (height-this.prevDrawHeight) / Math.abs(index-this.prevDrawIndex)
        arr[i] = Math.round(curHeight)
        this.clearColumn(context, i)
        this.drawColumn(context, arr, i, i)
      }
    }

    const arr = this.arr
    arr[index] = height
    this.clearColumn(context, index)
    this.drawColumn(context, arr, index, index)
    this.prevDrawIndex = index
    this.prevDrawHeight = height
  }

  startDrawOnCanvas = () => {
    if (!this.state.canDraw) return 

    this.stopSorting()
    this.setState({ isDrawing: true })
  }

  endDrawOnCanvas = () => {
    this.prevDrawIndex = null
    this.prevDrawHeight = null
    this.setState({ isDrawing: false })
  }

  toggleCanDraw = () => {    
    this.setState({ canDraw: !this.state.canDraw })
  }

  render() {
    return (
      <div className="App">
        <div className="App-header" >
          <AppBar position="relative">
            <Toolbar className="toolbar">
              <div>
                <Button variant="contained" color="secondary" onClick={() => this.sort(this.arr)} disableElevation>
                  Sort
                </Button>
              </div>
              <div>
                <Button variant="contained" color="secondary" onClick={this.shuffleAndDraw} disableElevation>
                  Shuffle
                </Button>
              </div>
              <div>
                <Button variant="contained" color="secondary" onClick={this.resetAndDraw} disableElevation>
                  Reset
                </Button>
              </div>
              <div>
                <FormControlLabel
                  control={<Switch checked={this.state.canDraw} onChange={this.toggleCanDraw} name="canDraw" />}
                  label="Draw Mode"
                />
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

          <div className="canvas-wrapper" id="canvas-wrapper" onClick={this.closeDisplaySettings}>
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
          >
            <div className="chevron-wrapper">
              <IconButton onClick={this.toggleDisplaySettings}>
                <ChevronRightIcon />
              </IconButton>
            </div>
            <div className="sortAlgChoice-wrapper">
              <FormControl component="fieldset">
                <Typography
                  align="left"
                  variant="h6"
                  color="textSecondary"
                  gutterBottom
                >
                  Sorting Algorithm
                </Typography>
                <RadioGroup
                  className="choiceGroup"
                  aria-label="choiceGroup"
                  name="choiceGroup"
                  value={this.state.chosenSortAlg}
                  onChange={this.chooseSortAlg}
                >
                  {Object.keys(this.sortingAlgorithms).map((v) => (
                    <FormControlLabel
                      className="choice"
                      value={v}
                      key={v}
                      control={<Radio />}
                      label={v}
                    />
                  ))}
                </RadioGroup>
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
                  defaultValue={initColumnNbr}
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
                  defaultValue={swapTime}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  min={0}
                  step={0.1}
                  max={10}
                  scale={(x) => timeScale(x)}
                  onChangeCommitted={(e, value) => this.changeSwapTime(e, timeScale(value))}
                />
              </div>
            </div>
          </Drawer>
        </div>
      </div>
    );
  }
}

export default App;
