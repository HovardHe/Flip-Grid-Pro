import React from 'react';
import { GameMode } from '../types';

interface ControlsProps {
  mode: GameMode;
  setMode: (m: GameMode) => void;
  gridSize: number;
  setGridSize: (s: number) => void;
  onReset: () => void;
  onRandomize: () => void;
  onSolve: () => void;
  solutionVisible: boolean;
  movesCount: number;
  timer: number; // in milliseconds
}

export const Controls: React.FC<ControlsProps> = ({ 
  mode, setMode, gridSize, setGridSize, onReset, onRandomize, onSolve, solutionVisible, movesCount, timer
}) => {
  
  // Format timer ms to MM:SS.d
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const deciseconds = Math.floor((ms % 1000) / 100);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${deciseconds}`;
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-md mx-auto p-4">
      
      {/* Stats Panel */}
      <div className="flex gap-3">
        <div className="flex-1 flex flex-col items-center bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
           <span className="text-slate-400 text-xs font-bold uppercase">步数</span>
           <span className="text-2xl font-black text-white font-mono">{String(movesCount).padStart(2, '0')}</span>
        </div>
        <div className="flex-1 flex flex-col items-center bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
           <span className="text-slate-400 text-xs font-bold uppercase">时间</span>
           <span className={`text-2xl font-black font-mono ${timer > 0 ? 'text-primary' : 'text-slate-500'}`}>
             {formatTime(timer)}
           </span>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={onRandomize}
          className="bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold py-3 px-4 rounded-xl transition-all"
        >
          随机打乱
        </button>
        <button 
          onClick={onReset}
          className="bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold py-3 px-4 rounded-xl transition-all"
        >
          重置
        </button>
      </div>

      {/* Grid Size Selector */}
      <div className="bg-slate-800 p-1.5 rounded-xl flex items-center justify-between">
         <span className="pl-3 text-xs font-bold text-slate-400 uppercase">网格尺寸</span>
         <div className="flex gap-1">
           {[3, 4, 5, 6].map(size => (
             <button
                key={size}
                onClick={() => setGridSize(size)}
                className={`w-10 h-8 rounded-lg text-sm font-bold transition-all ${
                  gridSize === size 
                  ? 'bg-primary text-slate-900 shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
             >
               {size}²
             </button>
           ))}
         </div>
      </div>

      {/* Mode Switcher */}
      <div className="bg-slate-800 p-1 rounded-xl flex">
        {[
          { id: GameMode.PLAY, label: '游玩' },
          { id: GameMode.EDIT, label: '编辑' },
          { id: GameMode.LAYOUT, label: '布局' }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as GameMode)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wide ${
              mode === m.id 
                ? 'bg-slate-200 text-slate-900 shadow-md' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Solver */}
      <button 
        onClick={onSolve}
        className={`w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
          solutionVisible 
            ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        {solutionVisible ? '隐藏答案' : '求解最优解'}
      </button>

    </div>
  );
};