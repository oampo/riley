export const enum PlotterCommandType {
  HOME = "home",
  SLEEP = "sleep",
  PEN_UP = "pen-up",
  PEN_DOWN = "pen-down",
  MOVE = "move",
}

export type PlotterCommand =
  | {
      type: PlotterCommandType.HOME;
    }
  | {
      type: PlotterCommandType.SLEEP;
    }
  | {
      type: PlotterCommandType.PEN_UP;
      height?: number;
    }
  | {
      type: PlotterCommandType.PEN_DOWN;
      height?: number;
    }
  | {
      type: PlotterCommandType.MOVE;
      x?: number;
      y?: number;
    };
