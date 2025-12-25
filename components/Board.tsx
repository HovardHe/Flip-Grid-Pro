import React from 'react';
import { GridState, GameMode } from '../types';
import { Cell } from './Cell';

interface BoardProps {
  grid: GridState;
  gridSize: number;
  mode: GameMode;
  onCellClick: (id: number) => void;
  solutionMoves?: number[];
}

export const Board: React.FC<BoardProps> = ({ grid, gridSize, mode, onCellClick, solutionMoves }) => {
  return (
    <div 
      className="grid p-4 md:p-6 bg-slate-800 rounded-3xl shadow-2xl shadow-black/50 border border-slate-700 relative transition-all duration-300"
      style={{ 
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        gap: '0.5rem'
      }}
    >
      {grid.map((cell) => {
        const solutionIndex = solutionMoves ? solutionMoves.indexOf(cell.id) : -1;
        return (
          <Cell 
            key={cell.id} 
            data={cell} 
            mode={mode} 
            gridSize={gridSize}
            onClick={onCellClick}
            solverHintIndex={solutionIndex !== -1 ? solutionIndex : undefined}
          />
        );
      })}
    </div>
  );
};
