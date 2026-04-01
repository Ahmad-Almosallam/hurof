import type { LetterCellResponse } from '../../types/api';

interface HexCellProps {
  cell: LetterCellResponse;
  team1Color: string;
  team2Color: string;
  isWinningPath?: boolean;
  onClick?: (cell: LetterCellResponse) => void;
  interactive?: boolean;
}

/** The "border" hex is the outer clipped div; its background peeks around the inner cell. */
function getBorderBg(state: string, team1Color: string, team2Color: string): string {
  switch (state) {
    case 'Active':        return '#F0A030';  // warm amber ring
    case 'AssignedTeam1': return team1Color;
    case 'AssignedTeam2': return team2Color;
    default:              return '#C9A84C';  // gold honeycomb ring
  }
}

function getCellBg(state: string, team1Color: string, team2Color: string): string {
  switch (state) {
    case 'Active':        return '#F59E0B';
    case 'AssignedTeam1': return team1Color;
    case 'AssignedTeam2': return team2Color;
    default:              return '#080E1A';  // near-black inner gem
  }
}

function getCellTextColor(state: string): string {
  switch (state) {
    case 'Active':        return '#07090F';
    case 'AssignedTeam1':
    case 'AssignedTeam2': return '#ffffff';
    default:              return '#5A7A9A';  // muted blue for unselected letter
  }
}

export function HexCell({ cell, team1Color, team2Color, isWinningPath, onClick, interactive = true }: HexCellProps) {
  const borderBg = getBorderBg(cell.state, team1Color, team2Color);
  const innerBg  = getCellBg(cell.state, team1Color, team2Color);
  const color    = getCellTextColor(cell.state);
  const cursor   = interactive ? 'pointer' : 'default';

  // Glow color for winning-path animation (matches fill)
  const cellGlow = cell.state === 'AssignedTeam1' ? team1Color
                 : cell.state === 'AssignedTeam2' ? team2Color
                 : '#C9A84C';

  return (
    <div
      className={`hex-cell-border${isWinningPath ? ' winning' : ''}${interactive ? ' transition-all hover:brightness-110' : ''}`}
      style={{
        cursor,
        backgroundColor: borderBg,
        '--cell-glow': cellGlow,
      } as React.CSSProperties}
      onClick={() => interactive && onClick?.(cell)}
    >
      <div
        className="hex-cell"
        style={{
          backgroundColor: innerBg,
          color,
          fontSize: '1.4rem',
          fontWeight: 700,
          fontFamily: "'Amiri', serif",
        }}
      >
        {cell.letter}
      </div>
    </div>
  );
}
