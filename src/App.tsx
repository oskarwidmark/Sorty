import React, { MouseEvent } from 'react';
import './App.css';
import { SelectChangeEvent, Stack, Tab, Tabs } from '@mui/material';
import {
  SortValue,
  SortName,
  ResetPreset,
  ResetFunction,
  Operator,
  AlgorithmOptions,
  ColorPreset,
  AppState,
  Settings,
} from './types';
import { SortingAlgorithms } from './sorting-algorithms';
import { createArr, shuffleArray, sleep, toHz } from './utils';
import { SideDrawer } from './SideDrawer';
import {
  RAINBOW_BACKGROUND_COLOR,
  INIT_STATE,
  INIT_SETTINGS,
} from './constants';
import { SortAppBar } from './AppBar';
import { CanvasController } from './canvas-controller';
import { ColorTab } from './ColorTab';
import { ColumnSlider } from './ColumnSlider';
import { Options } from './Options';
import { TimeSlider } from './TimeSlider';
import { Audiotrack, BarChart, Palette } from '@mui/icons-material';
import { TabPanel } from './TabPanel';
import { NonCustomOscillatorType } from 'tone/build/esm/source/oscillator/OscillatorInterface';
import { TitledSelect } from './TitledSelect';
import { SoundTab } from './SoundTab';

type Props = {
  playSound: (params: { frequency: number; duration?: string }) => void;
  stopSounds: () => void;
  soundType: NonCustomOscillatorType;
  setSoundType: (type: NonCustomOscillatorType) => void;
  setVolume: (volume: number) => void;
};

class App extends React.Component<Props> {
  private sortingAlgorithms: SortingAlgorithms;
  private resetPresets: Record<ResetPreset, ResetFunction>;
  private arr: SortValue[];
  private nbrOfSwaps: number = 0;
  private nbrOfComparisons: number = 0;
  private nbrOfAuxWrites: number = 0;
  state: AppState;
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

    this.sortingAlgorithms = new SortingAlgorithms({
      columnNbr: this.state.settings.columnNbr,
      compare: this.compare,
      valueCompare: this.valueCompare,
      drawAndSwap: this.drawAndSwap,
      registerAuxWrite: this.registerAuxWrite,
    });

    this.canvasController = new CanvasController({
      canvasRef:
        React.createRef<HTMLCanvasElement>() as React.RefObject<HTMLCanvasElement>,
      columnNbr: this.state.settings.columnNbr,
      colorPreset: this.state.settings.colorPreset,
      columnColor1: this.state.settings.columnColor1,
      columnColor2: this.state.settings.columnColor2,
      highlightColor: this.state.settings.highlightColor,
    });

    this.arr = createArr(this.state.settings.columnNbr);
    this.resetPresets = {
      [ResetPreset.Shuffle]: () => shuffleArray(this.arr),
      [ResetPreset.Sorted]: () => this.arr.sort((a, b) => a.value - b.value),
      [ResetPreset.ReverseSorted]: () =>
        this.arr.sort((a, b) => b.value - a.value),
    };
    this.resetPresets[this.state.settings.resetPreset]();

    this.props.setVolume(this.state.settings.soundVolume);
    this.props.setSoundType(this.state.settings.soundType);
  }

  setSettings = (
    settings:
      | Partial<Settings>
      | ((prevSettings: Settings) => Partial<Settings>),
    callback?: () => Promise<void> | void,
  ) => {
    const set = (prevState: AppState) => {
      const newSettings =
        settings instanceof Function ? settings(prevState.settings) : settings;
      return {
        ...prevState,
        settings: { ...prevState.settings, ...newSettings },
      };
    };

    this.setState(set, async () => {
      await callback?.();
      localStorage.setItem('settings', JSON.stringify(this.state.settings));
    });
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
    this.setState({ nbrOfSwaps: 0, nbrOfComparisons: 0, nbrOfAuxWrites: 0 });
    this.nbrOfComparisons = 0;
    this.nbrOfSwaps = 0;
    this.nbrOfAuxWrites = 0;
  };

  sort = async (arr: SortValue[]) => {
    if (this.state.isSorting) {
      this.stopSorting();
      return;
    }

    this.nbrOfSwaps = 0;
    this.nbrOfComparisons = 0;
    this.nbrOfAuxWrites = 0;
    this.setState(
      {
        isSorting: true,
        nbrOfSwaps: 0,
        nbrOfComparisons: 0,
        nbrOfAuxWrites: 0,
      },
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
          nbrOfAuxWrites: this.nbrOfAuxWrites,
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
      if (this.state.settings.playSoundOnSwap) {
        this.playSoundForColumn(arr, i1);
      }

      // With a zero swapTime, maximum update depth will be exceeded
      // when updating state too often
      this.setState((prevState: AppState) => ({
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
    return this._compare({
      arr,
      i1,
      operator,
      i2,
    });
  };

  valueCompare = async (
    arr: SortValue[],
    i: number,
    operator: Operator,
    value: number,
  ): Promise<boolean> => {
    return this._compare({
      arr,
      i1: i,
      operator,
      value,
    });
  };

  async _compare(
    params: { arr: SortValue[]; i1: number; operator: Operator } & (
      | { value: number }
      | { i2: number }
    ),
  ) {
    const { arr, i1, operator } = params;
    if (!this.state.isSorting) throw Error('isSorting is false!');
    this.nbrOfComparisons++;
    if (this.state.settings.compareTime) {
      if (this.state.settings.playSoundOnComparison) {
        this.playSoundForColumn(arr, i1);
      }
      // With a zero compareTime, maximum update depth will be exceeded
      // when updating state too often
      this.setState((prevState: AppState) => ({
        nbrOfComparisons: prevState.nbrOfComparisons + 1,
      }));
      const indexes = 'value' in params ? [i1] : [i1, params.i2];
      this.canvasController.highlightColumns(arr, indexes);
      await sleep(this.state.settings.compareTime);
    }

    const value = 'value' in params ? params.value : arr[params.i2].value;

    switch (operator) {
      case '<':
        return arr[i1].value < value;
      case '>':
        return arr[i1].value > value;
      case '<=':
        return arr[i1].value <= value;
      case '>=':
        return arr[i1].value >= value;
    }
  }

  public async swap(arr: SortValue[], i1: number, i2: number) {
    if (!this.state.isSorting) throw Error('isSorting is false!');

    [arr[i1], arr[i2]] = [arr[i2], arr[i1]];
  }

  registerAuxWrite = async (arr: SortValue[], i: number) => {
    if (!this.state.isSorting) throw Error('isSorting is false!');

    this.nbrOfAuxWrites++;
    if (this.state.settings.auxWriteTime) {
      if (this.state.settings.playSoundOnAuxWrite) {
        this.playSoundForColumn(arr, i);
      }
      // With a zero auxWriteTime, maximum update depth will be exceeded
      // when updating state too often
      this.setState((prevState: AppState) => ({
        nbrOfAuxWrites: prevState.nbrOfAuxWrites + 1,
      }));
      this.canvasController.highlightColumns(arr, [i]);
      await sleep(this.state.settings.auxWriteTime);
    }
  };

  playSoundForColumn = (arr: SortValue[], i: number) => {
    if (!this.state.shouldPlaySound) return;

    this.props.playSound({
      frequency: toHz(
        arr[i].value,
        this.state.settings.columnNbr,
        this.state.settings.frequencyRange,
      ),
    });
  };

  toggleDisplaySettings = () => {
    this.setState({ areSettingsOpen: !this.state.areSettingsOpen });
  };

  chooseSortAlg = (event: SelectChangeEvent<string>) => {
    this.stopSorting();

    this.setSettings({ chosenSortAlg: event.target.value as SortName });
  };

  changeColumnNbr = (_: unknown, value: number | number[]) => {
    if (this.state.settings.columnNbr === value) return;

    const columnNbr = value instanceof Array ? value[0] : value;
    this.sortingAlgorithms.columnNbr = columnNbr;
    this.canvasController.columnNbr = columnNbr;
    this.setSettings({ columnNbr }, () => this.resetAndDraw());
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

  toggleCanDraw = () => {
    this.setState({ canDraw: !this.state.canDraw });
  };

  togglePlaySound = () => {
    this.setState((prevState: AppState) => ({
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

  setSoundType = (soundType: NonCustomOscillatorType) => {
    this.props.setSoundType(soundType);
    this.setSettings({ soundType });
  };

  setVolume = (volume: number) => {
    this.props.setVolume(volume);
    this.setSettings({ soundVolume: volume });
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
            nbrOfAuxWrites={this.state.nbrOfAuxWrites}
            sort={this.sort}
            shuffleAndDraw={this.shuffleAndDraw}
            resetAndDraw={this.resetAndDraw}
            toggleCanDraw={this.toggleCanDraw}
            toggleDisplaySettings={this.toggleDisplaySettings}
            shouldPlaySound={this.state.shouldPlaySound}
            togglePlaySound={this.togglePlaySound}
            onClick={() => this.setState({ areSettingsOpen: false })}
          />
          <div
            className="canvas-wrapper"
            id="canvas-wrapper"
            onClick={() => this.setState({ areSettingsOpen: false })}
          >
            <canvas
              className="App-canvas"
              ref={this.canvasController.canvasRef}
              onMouseDown={this.startDrawOnCanvas}
              onMouseMove={this.drawOnCanvas}
              onMouseUp={this.canvasController.endDraw}
              onMouseLeave={this.canvasController.endDraw}
            />
          </div>
          <SideDrawer
            areSettingsOpen={this.state.areSettingsOpen}
            toggleDisplaySettings={this.toggleDisplaySettings}
          >
            <Tabs
              variant="fullWidth"
              className="tabs"
              onChange={(_, tabIndex) => this.setState({ tabIndex })}
              value={this.state.tabIndex}
            >
              <Tab icon={<BarChart />} sx={{ minWidth: 0 }} />
              <Tab icon={<Palette />} sx={{ minWidth: 0 }} />
              <Tab icon={<Audiotrack />} sx={{ minWidth: 0 }} />
            </Tabs>
            <TabPanel value={this.state.tabIndex} index={0}>
              <TitledSelect
                title="Sorting Algorithm"
                value={this.state.settings.chosenSortAlg}
                onChange={this.chooseSortAlg}
                options={Object.values(SortName)}
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
              <Stack>
                <TimeSlider
                  title="Time per swap"
                  time={this.state.settings.swapTime}
                  changeTime={(swapTime) => this.setSettings({ swapTime })}
                />
                <TimeSlider
                  title="Time per comparison"
                  time={this.state.settings.compareTime}
                  changeTime={(compareTime) =>
                    this.setSettings({ compareTime })
                  }
                />
                <TimeSlider
                  title="Time per aux. write"
                  time={this.state.settings.auxWriteTime}
                  changeTime={(auxWriteTime) =>
                    this.setSettings({ auxWriteTime })
                  }
                />
              </Stack>
              <TitledSelect
                title="Reset Preset"
                value={this.state.settings.resetPreset}
                onChange={(event) => {
                  this.setSettings({
                    resetPreset: event.target.value as ResetPreset,
                  });
                }}
                options={Object.values(ResetPreset)}
              />
            </TabPanel>
            <TabPanel value={this.state.tabIndex} index={1}>
              <ColorTab
                colorPreset={this.state.settings.colorPreset}
                columnColor1={this.state.settings.columnColor1}
                columnColor2={this.state.settings.columnColor2}
                backgroundColor={this.state.settings.backgroundColor}
                highlightColor={this.state.settings.highlightColor}
                setColorPreset={this.setColorPreset}
                setColumnColor1={this.setColumnColor1}
                setColumnColor2={this.setColumnColor2}
                setBackgroundColor={(backgroundColor) =>
                  this.setSettings({ backgroundColor })
                }
                setHighlightColor={this.setHighlightColor}
              />
            </TabPanel>
            <TabPanel value={this.state.tabIndex} index={2}>
              <SoundTab
                soundType={this.state.settings.soundType}
                setSoundType={this.setSoundType}
                soundVolume={this.state.settings.soundVolume}
                setVolume={this.setVolume}
                frequencyRange={this.state.settings.frequencyRange}
                setFrequencyRange={(frequencyRange) =>
                  this.setSettings({ frequencyRange })
                }
                playSoundOnComparison={
                  this.state.settings.playSoundOnComparison
                }
                setPlaySoundOnComparison={(playSoundOnComparison) =>
                  this.setSettings({
                    playSoundOnComparison,
                  })
                }
                playSoundOnSwap={this.state.settings.playSoundOnSwap}
                setPlaySoundOnSwap={(playSoundOnSwap) =>
                  this.setSettings({ playSoundOnSwap })
                }
                playSoundOnAuxWrite={this.state.settings.playSoundOnAuxWrite}
                setPlaySoundOnAuxWrite={(playSoundOnAuxWrite) =>
                  this.setSettings({ playSoundOnAuxWrite })
                }
              />
            </TabPanel>
          </SideDrawer>
        </div>
      </div>
    );
  }
}

export default App;
