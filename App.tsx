import { useState, useEffect, useCallback, useRef } from 'react';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { GridState, GameMode } from './types';
import { NEIGHBOR_OFFSETS } from './constants';
import { solveGrid } from './utils/solver';

// Helper to create grid of dynamic size
const createInitialGrid = (size: number): GridState => {
  return Array.from({ length: size * size }, (_, i) => ({
    id: i,
    row: Math.floor(i / size),
    col: i % size,
    active: false,
    isHole: false,
  }));
};

function App() {
  const [gridSize, setGridSize] = useState(3);
  const [grid, setGrid] = useState<GridState>(createInitialGrid(3));
  const [mode, setMode] = useState<GameMode>(GameMode.PLAY);
  
  // Game Stats
  const [movesCount, setMovesCount] = useState(0);
  const [solution, setSolution] = useState<number[] | null>(null);
  const [winState, setWinState] = useState(false);
  
  // New State for Blind Start
  const [isGameStarted, setIsGameStarted] = useState(false);
  
  // Timer State
  const [timer, setTimer] = useState(0); // in ms
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerStartRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  // Timer Logic
  const stopTimer = () => {
    setIsTimerRunning(false);
    timerStartRef.current = null;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const resetTimer = () => {
    stopTimer();
    setTimer(0);
  };

  const startTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      timerStartRef.current = Date.now() - timer;
      const animate = () => {
        if (timerStartRef.current !== null) {
          setTimer(Date.now() - timerStartRef.current);
          requestRef.current = requestAnimationFrame(animate);
        }
      };
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const handleReset = (sizeOverride?: number) => {
    setSolution(null);
    setMovesCount(0);
    setWinState(false);
    resetTimer();
    setIsGameStarted(false); // Cover the board
    const size = sizeOverride || gridSize;
    // Reset to "All Off" (blank canvas) for manual editing or clean start
    setGrid(createInitialGrid(size));
  };

  // Handle Grid Size Change
  const handleSizeChange = (newSize: number) => {
    setGridSize(newSize);
    setGrid(createInitialGrid(newSize));
    handleReset(newSize);
  };

  const handleStartGame = () => {
    setIsGameStarted(true);
    startTimer();
  };

  // Check win condition
  useEffect(() => {
    if (mode === GameMode.PLAY) {
      // GOAL: ALL LIGHTS ON
      // Active must be true for all non-hole cells
      const allOn = grid.every(cell => cell.active || cell.isHole);
      
      if (allOn && movesCount > 0) {
        setWinState(true);
        stopTimer();
      } else {
        setWinState(false);
      }
    } else {
      setWinState(false);
      stopTimer();
    }
  }, [grid, mode, movesCount]);

  // Core toggle logic
  const toggleCell = useCallback((gridState: GridState, id: number, size: number, forceSingle = false): GridState => {
    const target = gridState.find(c => c.id === id);
    if (!target || target.isHole) return gridState;

    const newGrid = [...gridState];
    const flip = (index: number) => {
      newGrid[index] = { ...newGrid[index], active: !newGrid[index].active };
    };

    if (forceSingle) {
      flip(id);
    } else {
      NEIGHBOR_OFFSETS.forEach(offset => {
        const r = target.row + offset.r;
        const c = target.col + offset.c;
        if (r >= 0 && r < size && c >= 0 && c < size) {
          const neighborIndex = r * size + c;
          if (!newGrid[neighborIndex].isHole) {
             flip(neighborIndex);
          }
        }
      });
    }

    return newGrid;
  }, []);

  const handleCellClick = (id: number) => {
    if (solution) setSolution(null);

    if (mode === GameMode.LAYOUT) {
      setGrid(prev => {
        const next = [...prev];
        next[id] = { ...next[id], isHole: !next[id].isHole, active: false };
        return next;
      });
      return;
    }

    if (mode === GameMode.EDIT) {
      setGrid(prev => toggleCell(prev, id, gridSize, true));
      return;
    }

    if (mode === GameMode.PLAY) {
      // Timer is handled by handleStartGame now
      setGrid(prev => toggleCell(prev, id, gridSize, false));
      setMovesCount(c => c + 1);
    }
  };

  const handleRandomize = () => {
    handleReset();
    setMode(GameMode.PLAY);
    setIsGameStarted(false); // Ensure mask is on
    
    // Create Solvable State Logic for "All ON":
    let newGrid = createInitialGrid(gridSize).map(c => ({...c, active: true}));
    
    const moves = Math.floor(gridSize * gridSize * 1.5);
    
    for (let i = 0; i < moves; i++) {
       const randomId = Math.floor(Math.random() * (gridSize * gridSize));
       newGrid = toggleCell(newGrid, randomId, gridSize, false);
    }
    setGrid(newGrid);
  };

  const handleSolve = () => {
    if (solution) {
      setSolution(null);
      return;
    }
    const result = solveGrid(grid, gridSize);
    if (result.solved) {
      setSolution(result.moves);
    } else {
      alert(result.message);
    }
  };

  const [showRules, setShowRules] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
          FLIP<span className="text-primary">GRID</span>
        </h1>
        <p className="text-secondary text-xs md:text-sm font-medium tracking-wide uppercase">
          {mode === GameMode.PLAY ? '点亮所有方块' : `当前模式: ${mode}`}
        </p>
      </div>

      <div className="relative">
        <Board 
          grid={grid} 
          gridSize={gridSize}
          mode={mode} 
          onCellClick={handleCellClick}
          solutionMoves={solution || undefined}
        />

        {/* Blind Start Overlay */}
        {mode === GameMode.PLAY && !isGameStarted && !winState && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl">
            <div className="text-6xl mb-4 animate-bounce">🙈</div>
            <h3 className="text-3xl font-black text-white mb-2 tracking-tight">准备挑战</h3>
            <p className="text-slate-400 text-sm mb-8 max-w-[200px] text-center font-medium leading-relaxed">
              点击开始后将立即揭晓题目并开始计时
            </p>
            <button
              onClick={handleStartGame}
              className="bg-primary text-slate-900 text-xl font-black py-4 px-8 rounded-2xl shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:scale-105 hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all active:scale-95"
            >
              开始计时
            </button>
          </div>
        )}
        
        {winState && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm rounded-3xl animate-fade-in z-20 p-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4">
              CHALLENGE COMPLETE
            </h2>
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
               <div className="bg-slate-800 p-3 rounded-xl">
                 <div className="text-slate-400 text-xs">步数</div>
                 <div className="text-xl font-mono text-white">{movesCount}</div>
               </div>
               <div className="bg-slate-800 p-3 rounded-xl">
                 <div className="text-slate-400 text-xs">时间</div>
                 <div className="text-xl font-mono text-primary">{(timer / 1000).toFixed(2)}s</div>
               </div>
            </div>
            <button 
              onClick={handleRandomize}
              className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
            >
              下一关
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 w-full">
        <Controls 
          mode={mode}
          setMode={(m) => {
            setMode(m);
            // Hide board if switching to play mode to enforce blind start
            if (m === GameMode.PLAY) setIsGameStarted(false);
          }}
          gridSize={gridSize}
          setGridSize={handleSizeChange}
          onReset={() => handleReset()}
          onRandomize={handleRandomize}
          onSolve={handleSolve}
          solutionVisible={!!solution}
          movesCount={movesCount}
          timer={timer}
        />
      </div>

       <div className="mt-8 text-center opacity-40 hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setShowRules(!showRules)}
          className="text-xs text-slate-400 uppercase tracking-widest border-b border-transparent hover:border-slate-400 pb-1"
        >
          {showRules ? '隐藏帮助' : '如何使用'}
        </button>
        
        {showRules && (
          <div className="mt-4 max-w-xs mx-auto text-xs text-slate-500 space-y-2 text-left bg-slate-800 p-4 rounded-xl">
             <p>1. <span className="text-slate-300">随机打乱</span>生成新题目，题目会被遮挡。</p>
             <p>2. 点击<span className="text-primary font-bold">开始计时</span>揭开题目。</p>
             <p>3. 目标是<span className="text-primary font-bold">点亮所有灯</span>。</p>
             <p>4. 思考时间也会计入总成绩。</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
