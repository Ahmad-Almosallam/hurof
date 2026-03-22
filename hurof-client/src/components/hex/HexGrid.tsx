import type { LetterCellResponse } from '../../types/api';
import { HexCell } from './HexCell';

const HEX_W = 110;
const HEX_H = HEX_W * 1.1547;
const HEX_GAP = 0;
const HEX_ROW_STEP = HEX_H * 0.75 - 1;
const EDGE_SIZE = 12;
const EDGE_GAP = 6;

interface HexGridProps {
  cells: LetterCellResponse[];
  gridSize: number;
  team1Color: string;
  team2Color: string;
  winningPath?: Set<string>;
  onCellClick?: (cell: LetterCellResponse) => void;
  interactive?: boolean;
  scale?: number;
}

export function HexGrid({
  cells,
  gridSize,
  team1Color,
  team2Color,
  winningPath,
  onCellClick,
  interactive = true,
  scale = 1,
}: HexGridProps) {
  const gridHeight = HEX_ROW_STEP * gridSize + (HEX_H - HEX_ROW_STEP);
  const gridWidth = gridSize * (HEX_W + HEX_GAP) + HEX_W / 2 + HEX_GAP;

  const totalWidth = gridWidth + (EDGE_SIZE + EDGE_GAP) * 2;
  const totalHeight = gridHeight + (EDGE_SIZE + EDGE_GAP) * 2;

  const rows = Array.from({ length: gridSize }, (_, r) =>
    cells.filter(c => c.row === r).sort((a, b) => a.col - b.col)
  );

  const edgeOffset = EDGE_SIZE + EDGE_GAP;

  return (
    <div style={{ width: totalWidth * scale, height: totalHeight * scale, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: totalWidth, height: totalHeight, transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: '0 0' }}>

        {/* Team 1 — Top edge */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: edgeOffset,
          width: gridWidth,
          height: EDGE_SIZE,
          backgroundColor: team1Color,
          borderRadius: 6,
          opacity: 0.85,
        }} />

        {/* Team 1 — Bottom edge */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: edgeOffset,
          width: gridWidth,
          height: EDGE_SIZE,
          backgroundColor: team1Color,
          borderRadius: 6,
          opacity: 0.85,
        }} />

        {/* Team 2 — Right edge (col 0 side in RTL) */}
        <div style={{
          position: 'absolute',
          top: edgeOffset,
          right: 0,
          width: EDGE_SIZE,
          height: gridHeight,
          backgroundColor: team2Color,
          borderRadius: 6,
          opacity: 0.85,
        }} />

        {/* Team 2 — Left edge (col gridSize-1 side in RTL) */}
        <div style={{
          position: 'absolute',
          top: edgeOffset,
          left: 0,
          width: EDGE_SIZE,
          height: gridHeight,
          backgroundColor: team2Color,
          borderRadius: 6,
          opacity: 0.85,
        }} />

        {/* Cell area background */}
        <div style={{
          position: 'absolute',
          top: edgeOffset,
          right: edgeOffset,
          width: gridWidth,
          height: gridHeight,
          background: `conic-gradient(from -45deg, ${team1Color} 0deg 90deg, ${team2Color} 90deg 180deg, ${team1Color} 180deg 270deg, ${team2Color} 270deg 360deg)`,
          opacity: 0.25,
          borderRadius: 4,
        }} />

        {/* Hex cells */}
        <div style={{ position: 'absolute', top: edgeOffset, right: edgeOffset }}>
          <div style={{ position: 'relative', width: gridWidth, height: gridHeight }}>
            {rows.map((rowCells, rowIdx) => (
              <div
                key={rowIdx}
                style={{
                  position: 'absolute',
                  top: rowIdx * HEX_ROW_STEP,
                  right: rowIdx % 2 === 1 ? HEX_W / 2 + HEX_GAP / 2 : 0,
                  display: 'flex',
                  flexDirection: 'row-reverse',
                  gap: HEX_GAP,
                }}
              >
                {rowCells.map(cell => (
                  <HexCell
                    key={cell.id}
                    cell={cell}
                    team1Color={team1Color}
                    team2Color={team2Color}
                    isWinningPath={winningPath?.has(`${cell.row}-${cell.col}`)}
                    onClick={onCellClick}
                    interactive={interactive}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
