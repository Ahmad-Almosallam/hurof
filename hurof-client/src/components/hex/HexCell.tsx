import type { LetterCellResponse } from '../../types/api';

interface HexCellProps {
  cell: LetterCellResponse;
  team1Color: string;
  team2Color: string;
  isWinningPath?: boolean;
  onClick?: (cell: LetterCellResponse) => void;
  interactive?: boolean;
}

function getCellBg(state: string, team1Color: string, team2Color: string): string {
  switch (state) {
    case 'Active':        return '#f59e0b';
    case 'AssignedTeam1': return team1Color;
    case 'AssignedTeam2': return team2Color;
    default:              return '#1e293b';
  }
}

function getCellTextColor(state: string): string {
  return state === 'Unselected' ? '#94a3b8' : '#ffffff';
}

export function HexCell({ cell, team1Color, team2Color, isWinningPath, onClick, interactive = true }: HexCellProps) {
  const bg = getCellBg(cell.state, team1Color, team2Color);
  const color = getCellTextColor(cell.state);
  const cursor = interactive && cell.state !== 'Active' ? 'pointer' : 'default';

  return (
    <div
      className={`hex-cell-border${isWinningPath ? ' winning' : ''}`}
      style={{ cursor }}
      onClick={() => interactive && onClick?.(cell)}
    >
      <div
        className="hex-cell"
        style={{
          backgroundColor: bg,
          color,
          fontSize: '1.4rem',
          fontWeight: 700,
        }}
      >
        {cell.letter}
      </div>
    </div>
  );
}
