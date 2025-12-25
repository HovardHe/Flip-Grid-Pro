export interface CellState {
  id: number;
  row: number;
  col: number;
  active: boolean; // Is the light on?
  isHole: boolean; // Is this a missing tile?
}

export type GridState = CellState[];

export enum GameMode {
  PLAY = 'PLAY',
  EDIT = 'EDIT', // Edit active state
  LAYOUT = 'LAYOUT', // Edit holes
}

export interface SolverResult {
  solved: boolean;
  moves: number[]; // Array of cell IDs to click
  message: string;
}
