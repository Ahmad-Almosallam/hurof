export type LetterState = 'Unselected' | 'Active' | 'AssignedTeam1' | 'AssignedTeam2';
export type SessionStatus = 'Active' | 'Ended';

export interface LetterCellResponse {
  id: string;
  row: number;
  col: number;
  letter: string;
  state: LetterState;
}

export interface SessionResponse {
  id: string;
  roomCode: string;
  gridSize: number;
  status: SessionStatus;
  team1Color: string;
  team2Color: string;
  winnerTeam: number | null;
  buzzerLockedByPlayer: string | null;
  buzzerLockedAt: string | null;
  cells: LetterCellResponse[];
}

export interface QuestionResponse {
  questionId: string;
  letter: string;
  questionText: string;
  answer: string;
  questionIndex: number;
  totalQuestions: number;
}

export interface GridPosition {
  row: number;
  col: number;
}

export interface SetLetterStateResponse {
  cell: LetterCellResponse;
  winDetected: boolean;
  winnerTeam: number | null;
  winningPath: GridPosition[] | null;
}

export interface BuzzResponse {
  accepted: boolean;
  lockedBy: string;
}

export interface GameOverEvent {
  winnerTeam: number | null;
  winningPath: GridPosition[] | null;
}

export interface GameResetEvent {
  cells: LetterCellResponse[];
}

export type PlayerInfo = string;

export interface BuzzWinnerEvent {
  playerName: string;
  lockedAt: string;
}
