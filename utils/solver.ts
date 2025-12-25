import { GridState, SolverResult } from '../types';
import { NEIGHBOR_OFFSETS } from '../constants';

// Gaussian Elimination over GF(2)
// Solves Ax = b where x is the moves vector and b is the difference between current and target state.

export const solveGrid = (grid: GridState, size: number): SolverResult => {
  // 1. Identify active (non-hole) cells and map them to linear indices 0..N-1
  const activeCells = grid.filter(c => !c.isHole);
  const N = activeCells.length;
  
  if (N === 0) return { solved: true, moves: [], message: "无方块" };

  // Map real ID to equation index
  const idToEqIndex = new Map<number, number>();
  activeCells.forEach((cell, idx) => idToEqIndex.set(cell.id, idx));

  // 2. Build Augmented Matrix [A | b]
  // A[i][j] = 1 if clicking cell j affects cell i
  // b[i] = 1 if cell i needs to change state (i.e. currently OFF but target is ON)
  
  const matrix: bigint[] = new Array(N).fill(0n);

  activeCells.forEach((targetCell, i) => {
    let rowMask = 0n;

    // Determine which moves (j) affect this cell (i)
    activeCells.forEach((sourceCell, j) => {
      // Check if sourceCell is neighbor of targetCell
      const dr = Math.abs(sourceCell.row - targetCell.row);
      const dc = Math.abs(sourceCell.col - targetCell.col);
      const isNeighbor = (dr === 0 && dc === 0) || (dr + dc === 1); // Self or Manhattan dist 1

      if (isNeighbor) {
        rowMask |= (1n << BigInt(j));
      }
    });

    // Set the constant term (target state difference) at bit N
    // Goal: All ON (active: true).
    // If currently OFF (false), difference is 1 (needs flip).
    // If currently ON (true), difference is 0 (already matches target).
    if (!targetCell.active) {
      rowMask |= (1n << BigInt(N));
    }

    matrix[i] = rowMask;
  });

  // 3. Gaussian Elimination
  const pivotRow = new Array(N).fill(-1); // Stores which row is pivot for column j
  let nextPivotRow = 0;

  for (let j = 0; j < N; j++) {
    // Find a row with 1 in column j, starting from nextPivotRow
    let i = nextPivotRow;
    while (i < N && (matrix[i] & (1n << BigInt(j))) === 0n) {
      i++;
    }

    if (i < N) {
      // Swap rows
      [matrix[nextPivotRow], matrix[i]] = [matrix[i], matrix[nextPivotRow]];
      
      // Eliminate other rows
      for (let k = 0; k < N; k++) {
        if (k !== nextPivotRow && (matrix[k] & (1n << BigInt(j))) !== 0n) {
          matrix[k] ^= matrix[nextPivotRow];
        }
      }

      pivotRow[j] = nextPivotRow;
      nextPivotRow++;
    }
  }

  // 4. Back Substitution / Extract Solution
  // Check for inconsistency: Any row where all coeffs are 0 but constant is 1
  for (let i = nextPivotRow; i < N; i++) {
    if ((matrix[i] & (1n << BigInt(N))) !== 0n) {
       return { solved: false, moves: [], message: "此局无解" };
    }
  }

  // Determine solution
  const freeVars: number[] = [];
  const pivotVars: number[] = []; // Maps column j to row index
  for (let j = 0; j < N; j++) {
    if (pivotRow[j] === -1) freeVars.push(j);
    else pivotVars[j] = pivotRow[j];
  }

  // Helper to construct full solution given free variable values
  const getMovesForFreeVars = (freeVals: bigint): number[] => {
    let moves = 0n;
    // Set free vars
    freeVars.forEach((col, idx) => {
      if ((freeVals & (1n << BigInt(idx))) !== 0n) {
        moves |= (1n << BigInt(col));
      }
    });
    
    // Solve for pivot vars
    for (let j = 0; j < N; j++) {
      const row = pivotRow[j];
      if (row !== -1) {
        let val = (matrix[row] >> BigInt(N)) & 1n; // The constant
        
        // XOR with free variables present in this row
        freeVars.forEach(fCol => {
           if (fCol > j && (matrix[row] & (1n << BigInt(fCol))) !== 0n) {
             if ((moves & (1n << BigInt(fCol))) !== 0n) {
               val ^= 1n;
             }
           }
        });
        
        if (val === 1n) {
          moves |= (1n << BigInt(j));
        }
      }
    }
    
    // Convert moves bitmap to cell IDs
    const moveIds: number[] = [];
    for (let j = 0; j < N; j++) {
      if ((moves & (1n << BigInt(j))) !== 0n) {
        moveIds.push(activeCells[j].id);
      }
    }
    return moveIds;
  };

  // Find minimal solution
  let bestMoves: number[] | null = null;
  const numFree = freeVars.length;
  // Limit brute force if too many free variables (e.g. > 16) - unlikely in this game structure but safe guard
  const maxIter = 1 << Math.min(numFree, 10); 

  for (let i = 0; i < maxIter; i++) {
    const candidate = getMovesForFreeVars(BigInt(i));
    if (bestMoves === null || candidate.length < bestMoves.length) {
      bestMoves = candidate;
    }
  }

  if (bestMoves !== null) {
    return { 
      solved: true, 
      moves: bestMoves, 
      message: `最优解需 ${bestMoves.length} 步` 
    };
  }

  return { solved: false, moves: [], message: "计算错误" };
};
