import React from 'react';
import { CellState, GameMode } from '../types';

interface CellProps {
  data: CellState;
  mode: GameMode;
  onClick: (id: number) => void;
  solverHintIndex?: number;
  gridSize: number;
}

export const Cell: React.FC<CellProps> = ({ data, mode, onClick, solverHintIndex, gridSize }) => {
  const { active, isHole } = data;

  // Dynamic sizing based on grid size to fit screen
  // Base size decreases as grid size increases
  const sizeClasses = gridSize >= 5 
    ? "w-12 h-12 md:w-16 md:h-16 text-sm" 
    : gridSize === 4 
      ? "w-16 h-16 md:w-20 md:h-20 text-xl" 
      : "w-20 h-20 md:w-24 md:h-24 text-2xl";

  const gapClass = "m-1";

  if (isHole) {
    return (
      <div 
        onClick={() => mode === GameMode.LAYOUT && onClick(data.id)}
        className={`
          ${sizeClasses} ${gapClass} rounded-xl transition-all duration-300
          ${mode === GameMode.LAYOUT 
            ? 'bg-slate-800 border-2 border-dashed border-slate-600 cursor-pointer hover:border-slate-400' 
            : 'opacity-0 pointer-events-none'
          }
        `}
      />
    );
  }

  const isEditMode = mode === GameMode.EDIT;
  
  let bgColor = 'bg-surface';
  let shadowColor = 'shadow-slate-900';
  let translate = 'translate-y-0';

  if (active) {
    bgColor = 'bg-primary shadow-[0_0_15px_rgba(56,189,248,0.5)]';
    translate = '-translate-y-1';
  } else {
    bgColor = 'bg-surface hover:bg-slate-700';
  }

  if (isEditMode) {
    bgColor = active ? 'bg-accent shadow-[0_0_15px_rgba(244,114,182,0.4)]' : 'bg-slate-700';
  }

  return (
    <div
      onClick={() => onClick(data.id)}
      className={`
        relative ${sizeClasses} ${gapClass} rounded-xl 
        cursor-pointer transition-all duration-300 ease-out
        ${bgColor}
        shadow-lg ${shadowColor}
        ${translate}
        active:scale-95 active:translate-y-0
        flex items-center justify-center
      `}
    >
      <div className={`absolute inset-2 rounded-lg border-2 border-white/5 pointer-events-none`} />

      {solverHintIndex !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-[1px] animate-pulse">
           <span className="font-bold text-white drop-shadow-md">
             {solverHintIndex + 1}
           </span>
        </div>
      )}
      
      {mode === GameMode.LAYOUT && (
         <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
      )}
    </div>
  );
};
